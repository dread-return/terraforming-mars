/**
 * Plays bots of different difficulties against each other and reports who wins. For tuning the medium bot.
 *
 *   npx tsx src/tools/botArena.ts --games 20 --players 2 --seats easy,medium
 *
 * Options: --games N (default 10), --players N (default as many as --seats), --seats LIST (comma separated difficulties,
 * default easy,medium; the list repeats to fill the table), --seed N (default 1), --max-gen N (default 14),
 * --board NAME (default Tharsis).
 *
 * The seats rotate between games so that no difficulty always has the first move. A game that reaches --max-gen is
 * scored as it stands.
 */
import {BoardName} from '../common/boards/BoardName';
import {BOT_DIFFICULTIES, BotDifficulty} from '../common/game/NewGameConfig';
import {SeededRandom} from '../common/utils/Random';
import {Phase} from '../common/Phase';
import {isGameId, isPlayerId, isSpectatorId, safeCast} from '../common/Types';
import {generateRandomId} from '../server/utils/server-ids';
import {baseConfig} from './botGameConfig';

function arg(name: string, fallback: string): string {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 && i + 1 < process.argv.length ? process.argv[i + 1] : fallback;
}

async function main() {
  const {globalInitialize} = await import('../server/globalInitialize');
  const {Database} = await import('../server/database/Database');
  const {Game} = await import('../server/Game');
  const {Player} = await import('../server/Player');
  const {gameOptionsFromConfig} = await import('../server/game/GameOptionsFromConfig');
  const {calculateVictoryPoints} = await import('../server/game/calculateVictoryPoints');
  const {BotDriver} = await import('../server/bots/BotDriver');
  const {RandomBot} = await import('../server/bots/RandomBot');
  const {HeuristicBot} = await import('../server/bots/HeuristicBot');

  globalInitialize();
  // Nothing here should reach a database. Games are not saved.
  const lists = new Set(['getGameIds', 'getSaveIds', 'getParticipants', 'getSessions', 'purgeUnfinishedGames']);
  (Database as unknown as {getInstance: () => unknown}).getInstance = () => new Proxy({}, {
    get: (_, name: string) => () => Promise.resolve(lists.has(name) ? [] : undefined),
  });

  const seats = arg('seats', 'easy,medium').split(',').map((s) => s.trim());
  for (const seat of seats) {
    if (!(BOT_DIFFICULTIES as ReadonlyArray<string>).includes(seat)) {
      throw new Error(`Unknown difficulty '${seat}'. Choose from ${BOT_DIFFICULTIES.join(', ')}.`);
    }
  }
  const playerCount = Number(arg('players', String(seats.length)));
  const games = Number(arg('games', '10'));
  const seed = Number(arg('seed', '1'));
  const maxGen = Number(arg('max-gen', '14'));
  const board = arg('board', BoardName.THARSIS) as BoardName;

  const wins: Record<string, number> = {};
  const points: Record<string, Array<number>> = {};
  const finished: Array<boolean> = [];
  const started = Date.now();

  for (let g = 0; g < games; g++) {
    // SeededRandom wants a seed in [0, 1).
    const rng = new SeededRandom(((seed * 1000 + g) * 0.6180339887) % 1);
    const engineRandom = new SeededRandom(((seed * 1000 + g) * 0.7548776662) % 1);
    Math.random = () => engineRandom.next();

    // Seat i plays difficulty seats[(i + g) % seats.length]: the table rotates.
    const levels: Array<BotDifficulty> = [];
    for (let i = 0; i < playerCount; i++) {
      levels.push(seats[(i + g) % seats.length] as BotDifficulty);
    }
    const config = baseConfig(playerCount);
    const players = config.players.map((p, i) => {
      const player = new Player(p.name, p.color, p.beginner, p.handicap, safeCast(generateRandomId('p'), isPlayerId));
      player.botDifficulty = levels[i];
      return player;
    });
    const options = gameOptionsFromConfig(config, board);
    const game = Game.newInstance(safeCast(generateRandomId('g'), isGameId), players, players[0], safeCast(generateRandomId('s'), isSpectatorId), options, rng.next());
    const driver = new BotDriver({easy: new RandomBot(rng), medium: new HeuristicBot(rng, Infinity)});
    const isOver = () => game.phase === Phase.END;
    while (!isOver() && game.generation <= maxGen && driver.step(game) !== undefined) {
      // Keep playing.
    }

    const scores = players.map((p) => calculateVictoryPoints(p).total);
    const top = Math.max(...scores);
    const winners = players.filter((_, i) => scores[i] === top);
    for (const w of winners) {
      const level = levels[players.indexOf(w)];
      wins[level] = (wins[level] ?? 0) + 1 / winners.length;
    }
    players.forEach((_, i) => (points[levels[i]] ??= []).push(scores[i]));
    finished.push(isOver());
    console.log(`game ${g + 1}/${games}: ${levels.map((l, i) => `${l}=${scores[i]}`).join(' ')} gen ${game.generation}${isOver() ? '' : ' (capped)'}`);
  }

  const seconds = (Date.now() - started) / 1000;
  console.log(`\n${games} games, ${finished.filter(Boolean).length} finished, ${seconds.toFixed(0)}s`);
  for (const level of new Set(seats)) {
    const list = points[level] ?? [];
    const avg = list.reduce((a, b) => a + b, 0) / Math.max(1, list.length);
    console.log(`${level}: ${(wins[level] ?? 0).toFixed(1)} wins, average ${avg.toFixed(1)} VP over ${list.length} seats`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
