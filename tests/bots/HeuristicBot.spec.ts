import {expect} from 'chai';
import {BoardName} from '../../src/common/boards/BoardName';
import {Phase} from '../../src/common/Phase';
import {PLAYER_COLORS} from '../../src/common/Color';
import {SeededRandom} from '../../src/common/utils/Random';
import {isGameId, isPlayerId, isSpectatorId, safeCast} from '../../src/common/Types';
import {BotDriver} from '../../src/server/bots/BotDriver';
import {HeuristicBot} from '../../src/server/bots/HeuristicBot';
import {RandomBot} from '../../src/server/bots/RandomBot';
import {Database} from '../../src/server/database/Database';
import {Game} from '../../src/server/Game';
import {gameOptionsFromConfig} from '../../src/server/game/GameOptionsFromConfig';
import {Simulation} from '../../src/server/game/Simulation';
import {IGame} from '../../src/server/IGame';
import {IPlayer} from '../../src/server/IPlayer';
import {OrOptions} from '../../src/server/inputs/OrOptions';
import {SelectOption} from '../../src/server/inputs/SelectOption';
import {Player} from '../../src/server/Player';
import {generateRandomId} from '../../src/server/utils/server-ids';
import {baseConfig} from '../../src/tools/botGameConfig';
import {BotDifficulty} from '../../src/common/game/NewGameConfig';

function newBotGame(levels: ReadonlyArray<BotDifficulty>): IGame {
  const config = baseConfig(levels.length);
  const players = config.players.map((p, i) => {
    const player = new Player(p.name, p.color ?? PLAYER_COLORS[i], false, 0, safeCast(generateRandomId('p'), isPlayerId));
    player.botDifficulty = levels[i];
    return player;
  });
  return Game.newInstance(
    safeCast(generateRandomId('g'), isGameId), players, players[0], safeCast(generateRandomId('s'), isSpectatorId),
    gameOptionsFromConfig(config, BoardName.THARSIS), 0.42);
}

function isActionMenu(player: IPlayer): boolean {
  const input = player.getWaitingFor();
  return input instanceof OrOptions && input.options.some((o) => o instanceof SelectOption && o.title === 'Pass for this generation');
}

/** Plays with easy bots until a medium bot is looking at its action menu in generation 3. */
function gameAtAMediumMenu(): {game: IGame, player: IPlayer, driver: BotDriver} {
  const game = newBotGame(['medium', 'easy']);
  const driver = new BotDriver({easy: new RandomBot(new SeededRandom(0.3)), medium: new HeuristicBot(new SeededRandom(0.4))});
  // Let the medium bot's own turns be played by easy until generation 3 so the test is about one decision.
  const easyDriver = new BotDriver({easy: new RandomBot(new SeededRandom(0.3)), medium: new RandomBot(new SeededRandom(0.3))});
  for (let i = 0; i < 20000; i++) {
    const waiting = BotDriver.waitingBot(game);
    if (waiting === undefined) {
      break;
    }
    if (game.generation >= 3 && waiting.botDifficulty === 'medium' && isActionMenu(waiting)) {
      return {game, player: waiting, driver};
    }
    easyDriver.step(game);
  }
  throw new Error('never reached a medium action menu');
}

describe('HeuristicBot', () => {
  it('plays a few generations against a random bot without the engine rejecting anything', () => {
    const game = newBotGame(['medium', 'easy']);
    const driver = new BotDriver({easy: new RandomBot(new SeededRandom(0.3)), medium: new HeuristicBot(new SeededRandom(0.4))});

    let steps = 0;
    while (game.phase !== Phase.END && game.generation < 4 && driver.step(game) !== undefined) {
      steps++;
      expect(steps).lt(5000);
    }
    expect(game.generation).gte(4);
    // Anything the engine refused (a plan that no longer fit, a payment that fell short) shows up here.
    expect(driver.rejections.size).eq(0);
  });

  it('does not simply pass when it holds a cheap card that pays off', () => {
    const {player} = gameAtAMediumMenu();
    const menu = player.getWaitingFor() as OrOptions;
    const pass = menu.options.findIndex((o) => o instanceof SelectOption && o.title === 'Pass for this generation');
    // Everyone has something worth doing by generation 3, so a bot that ever acts will act here.
    const decisions = new Set<number>();
    for (let seed = 1; seed <= 3; seed++) {
      const response = new HeuristicBot(new SeededRandom(seed / 10)).decide(menu, player, 0);
      decisions.add((response as {index: number}).index);
    }
    expect(decisions.has(pass) && decisions.size === 1, `decisions: ${[...decisions]}`).is.false;
  });

  it('does not save or change the real game while it thinks', () => {
    const {game, player} = gameAtAMediumMenu();
    const menu = player.getWaitingFor()!;

    let saves = 0;
    const original = Database.getInstance;
    (Database as unknown as {getInstance: () => unknown}).getInstance = () => new Proxy({}, {
      get: (_, name: string) => name === 'saveGame' ?
        () => {
          saves++;
          return Promise.resolve();
        } :
        () => Promise.resolve(undefined),
    });
    try {
      const before = JSON.stringify(game.serialize());
      new HeuristicBot(new SeededRandom(0.5)).decide(menu, player, 0);
      expect(saves).eq(0);
      expect(JSON.stringify(game.serialize())).eq(before);
      expect(Simulation.active).is.false;
    } finally {
      (Database as unknown as {getInstance: unknown}).getInstance = original;
    }
  });

  it('carries out an action it planned without the engine refusing a step', () => {
    const {game, player, driver} = gameAtAMediumMenu();
    const generation = game.generation;
    // The menu, then whatever the chosen action asks, until it is someone else's turn or the next menu.
    let answered = 0;
    do {
      driver.step(game);
      answered++;
    } while (answered < 40 && BotDriver.waitingBot(game) === player && !isActionMenu(player) && game.generation === generation);
    expect(answered).gt(0);
    expect(driver.rejections.size).eq(0);
  });
});
