import * as responses from '../server/responses';
import {Handler} from './Handler';
import {Context} from './IHandler';
import {Database} from '../database/Database';
import {Cloner} from '../database/Cloner';
import {Game} from '../Game';
import {GameOptions} from '../game/GameOptions';
import {gameOptionsFromConfig} from '../game/GameOptionsFromConfig';
import {Player} from '../Player';
import {Server} from '../models/ServerModel';
import {NewGameConfig} from '../../common/game/NewGameConfig';
import {safeCast, isGameId, isSpectatorId, isPlayerId} from '../../common/Types';
import {generateRandomId} from '../utils/server-ids';
import {IGame} from '../IGame';
import {Request} from '../Request';
import {Response} from '../Response';
import {QuotaConfig, QuotaHandler} from '../server/QuotaHandler';
import {durationToMilliseconds} from '../utils/durations';
import {readBody} from './readBody';
import {RouteError} from './RouteError';
import {CEO_CARDS_DEALT_PER_PLAYER} from '../../common/constants';
import {validateCustomMA} from '../../common/ma/CustomMA';
import {hasNegativeEscapeVelocityOption} from '../../common/game/escapeVelocity';
import {playBots} from '../bots/BotScheduler';
import {BOT_DIFFICULTIES} from '../../common/game/NewGameConfig';

function parseQuotaConfig(struct: any): QuotaConfig {
  let {limit} = struct;
  const {per} = struct;
  if (limit === undefined) {
    throw new Error('limit is absent');
  }
  limit = Number.parseInt(limit);
  if (isNaN(limit)) {
    throw new Error('limit is invalid');
  }
  if (per === undefined) {
    throw new Error('per is absent');
  }
  const perMs = durationToMilliseconds(per);
  if (isNaN(perMs)) {
    throw new Error('per is invalid');
  }
  return {limit, perMs};
}

// GAME_QUOTA accepts either a single {limit, per} object, or a JSON array of
// them for multiple independent tiers (e.g. a burst limit and a daily limit).
// A request must satisfy every configured tier to succeed.
function getQuotaConfigs(): Array<QuotaConfig> {
  const defaultQuota = {limit: 1, perMs: 1}; // Effectively, no limit.
  const val = process.env.GAME_QUOTA;
  if (val) {
    try {
      const parsed = JSON.parse(val);
      const structs = Array.isArray(parsed) ? parsed : [parsed];
      if (structs.length === 0) {
        throw new Error('GAME_QUOTA array is empty');
      }
      return structs.map(parseQuotaConfig);
    } catch (e) {
      console.warn('While initializing quota:', (e instanceof Error ? e.message : e));
    }
  }
  return [defaultQuota];
}

export class ApiCreateGame extends Handler {
  public static readonly INSTANCE = new ApiCreateGame();
  private quotaHandlers: Array<QuotaHandler>;

  public constructor(quotaConfigs: Array<QuotaConfig> = getQuotaConfigs()) {
    super();
    this.quotaHandlers = quotaConfigs.map((config) => new QuotaHandler(config));
  }

  /**
   * Validates that each custom list can deal every player their starting cards.
   *
   * Throws a bad request `RouteError` naming the minimum size when a list is too small. Matches the checks in
   * CreateGameForm.
   */
  public validateCustomLists(gameReq: NewGameConfig): void {
    const playerCount = gameReq.players.length;

    function validate(list: ReadonlyArray<unknown> | undefined, perPlayerCount: number, type: string): void {
      if (list === undefined) {
        return;
      }
      const required = playerCount * perPlayerCount;
      if (list.length > 0 && list.length < required) {
        throw RouteError.badRequest(`Must select at least ${required} ${type}`);
      }
    }
    validate(gameReq.customCorporationsList, gameReq.startingCorporations, 'corporations');
    validate(gameReq.customPreludes, gameReq.startingPreludes, 'preludes');
    validate(gameReq.customCeos, Math.max(gameReq.startingCeos ?? 0, CEO_CARDS_DEALT_PER_PLAYER), 'CEOs');
  }

  // TODO(kberg): much of this code can be moved outside of handler, and that
  // would be better.
  public override async post(req: Request, res: Response, ctx: Context): Promise<void> {
    const withinQuota = this.quotaHandlers.every((handler) => handler.isWithinQuota(ctx));
    if (!withinQuota) {
      responses.quotaExceeded(req, res);
      return;
    }

    const body = await readBody(req);
    try {
      const gameReq = JSON.parse(body) as NewGameConfig;
      this.validateCustomLists(gameReq);
      if (gameReq.escapeVelocity !== undefined && hasNegativeEscapeVelocityOption(gameReq.escapeVelocity)) {
        throw RouteError.badRequest('Escape Velocity values cannot be negative.');
      }
      if (gameReq.boards.length === 0) {
        throw RouteError.badRequest('Must select at least one board');
      }
      const gameId = safeCast(generateRandomId('g'), isGameId);
      const spectatorId = safeCast(generateRandomId('s'), isSpectatorId);
      for (const p of gameReq.players) {
        if (p.botDifficulty !== undefined && !(BOT_DIFFICULTIES as ReadonlyArray<string>).includes(p.botDifficulty)) {
          throw RouteError.badRequest(`Unknown bot difficulty '${String(p.botDifficulty)}'`);
        }
      }
      if (gameReq.players.length === 1 && gameReq.players[0].botDifficulty !== undefined) {
        throw RouteError.badRequest('A solo game needs a human player');
      }
      const players = gameReq.players.map((p) => {
        const player = new Player(
          p.name,
          p.color,
          p.beginner,
          Number(p.handicap), // For some reason handicap is coming up a string.
          safeCast(generateRandomId('p'), isPlayerId),
        );
        player.botDifficulty = p.botDifficulty;
        return player;
      });
      let firstPlayerIdx = 0;
      for (let i = 0; i < gameReq.players.length; i++) {
        if (gameReq.players[i].first === true) {
          firstPlayerIdx = i;
          break;
        }
      }

      const boardName = gameReq.boards[Math.floor(Math.random() * gameReq.boards.length)];

      const gameOptions: GameOptions = gameOptionsFromConfig(gameReq, boardName);

      try {
        validateCustomMA(gameOptions.customMA, gameOptions.randomMA, gameOptions.venusNextExtension);
      } catch (e) {
        throw RouteError.badRequest(e instanceof Error ? e.message : String(e));
      }

      let game: IGame;
      if (gameOptions.clonedGamedId !== undefined && !gameOptions.clonedGamedId.startsWith('#')) {
        const serialized = await Database.getInstance().getGameVersion(gameOptions.clonedGamedId, 0);
        game = Cloner.clone(gameId, players, firstPlayerIdx, serialized);
      } else {
        const seed = Math.random();
        game = Game.newInstance(gameId, players, players[firstPlayerIdx], spectatorId, gameOptions, seed);
      }
      ctx.gameLoader.add(game);
      playBots(game);
      // Only games that are actually created count against the quota.
      this.quotaHandlers.forEach((handler) => handler.record(ctx));
      responses.writeJson(res, ctx, Server.getSimpleGameModel(game));
    } catch (error) {
      if (error instanceof RouteError) {
        throw error;
      }
      responses.internalServerError(req, res, error);
    }
  }
}

