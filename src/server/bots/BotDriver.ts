import {IGame} from '../IGame';
import {IPlayer} from '../IPlayer';
import {PlayerInput} from '../PlayerInput';
import {InputError} from '../inputs/InputError';
import {IBot} from './IBot';
import {HeuristicBot} from './HeuristicBot';
import {RandomBot} from './RandomBot';
import {BotDifficulty} from '../../common/game/NewGameConfig';

/** The most times one input is answered before the bot gives up on it. */
export const MAX_ATTEMPTS = 100;

/** Thrown when every attempt to answer an input was rejected: the game is stuck waiting for a bot. */
export class BotStuckError extends Error {
  constructor(public readonly player: IPlayer, public readonly input: PlayerInput, public readonly lastError: unknown) {
    super(`${player.name} (bot) is stuck on ${input.constructor.name} '${typeof input.title === 'string' ? input.title : input.title.message}' after ${MAX_ATTEMPTS} attempts: ${lastError instanceof Error ? lastError.message : lastError}`, {cause: lastError});
  }
}

/**
 * Errors that mean the engine itself broke, not that the answer was wrong. They are never retried: retrying with
 * another random answer would hide the bug, and the game state can't be trusted afterwards.
 */
function isEngineBug(e: unknown): boolean {
  return e instanceof TypeError || e instanceof RangeError || e instanceof ReferenceError || e instanceof SyntaxError;
}

/**
 * Answers the inputs the game is waiting for from bot seats.
 *
 * It is synchronous and knows nothing about timing, databases or HTTP, so the simulator can run whole games in a loop
 * and the server can wrap it with delays (see BotScheduler).
 */
export class BotDriver {
  /** Answers given, by input class, for the coverage report. */
  public readonly answered = new Map<string, number>();
  /**
   * Answers the engine rejected and the bot retried, by message. Most are the bot guessing wrong (a payment that falls a
   * little short); one that looks like an engine message deserves a look.
   */
  public readonly rejections = new Map<string, number>();
  /** Where the first rejection with each message came from: the top of its stack, for finding the cause. */
  public readonly rejectionOrigins = new Map<string, string>();

  constructor(private readonly bots: Record<BotDifficulty, IBot> = {easy: new RandomBot(), medium: new HeuristicBot()}) {}

  /**
   * The bot seat that has a question to answer, if any.
   *
   * An `optional` input is one the player already answered and may still change (drafting: "change your selection until
   * all players have selected"). The game moves on when the others answer, so the bot leaves those alone, or it would
   * keep re-answering and never let anyone else pick.
   */
  public static waitingBot(game: IGame): IPlayer | undefined {
    return game.players.find((p) => {
      const input = p.getWaitingFor();
      return p.isBot && input !== undefined && input.optional !== true;
    });
  }

  /** True when a bot seat is waiting for an answer. */
  public static hasWaitingBot(game: IGame): boolean {
    return BotDriver.waitingBot(game) !== undefined;
  }

  /**
   * Answers one pending bot input.
   *
   * @return the player who answered, or undefined when no bot is waiting (a human's turn, or the game is over).
   */
  public step(game: IGame): IPlayer | undefined {
    const player = BotDriver.waitingBot(game);
    if (player === undefined) {
      return undefined;
    }
    this.answer(player);
    return player;
  }

  /** Answers bot inputs until none is waiting, or `maxSteps` answers were given. Returns the number given. */
  public run(game: IGame, maxSteps: number = Infinity): number {
    let steps = 0;
    while (steps < maxSteps && this.step(game) !== undefined) {
      steps++;
    }
    return steps;
  }

  private answer(player: IPlayer): void {
    const input = player.getWaitingFor();
    if (input === undefined) {
      return;
    }
    let lastError: unknown;
    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
      try {
        const response = this.bots[player.botDifficulty ?? 'easy'].decide(input, player, attempt);
        // Player.process puts the input back when it throws, so the next attempt answers the same question.
        player.process(response);
        const name = input.constructor.name;
        this.answered.set(name, (this.answered.get(name) ?? 0) + 1);
        return;
      } catch (e) {
        if (isEngineBug(e)) {
          throw e;
        }
        lastError = e;
        if (!(e instanceof InputError)) {
          const message = e instanceof Error ? e.message : String(e);
          this.rejections.set(message, (this.rejections.get(message) ?? 0) + 1);
          if (e instanceof Error && !this.rejectionOrigins.has(message)) {
            this.rejectionOrigins.set(message, (e.stack ?? '').split('\n').slice(1, 7).map((l) => l.trim().replace(/\(.*\/src\//, '(src/').replace(/^at .*\/src\//, 'at src/')).join(' < '));
          }
        }
        if (player.getWaitingFor() === undefined) {
          // The answer was applied and then something later threw. The game moved on; retrying would answer a new question.
          throw e;
        }
      }
    }
    throw new BotStuckError(player, input, lastError);
  }
}
