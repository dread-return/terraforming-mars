import {GameId} from '../../common/Types';
import {GameLoader} from '../database/GameLoader';
import {IGame} from '../IGame';
import {BotDriver} from './BotDriver';

/** Pause before each bot answer, so people at the table can follow what the bots do. */
const DEFAULT_DELAY_MS = 800;

const running = new Set<GameId>();

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Lets the bots of a live game play whenever one of them is waiting.
 *
 * Call it after anything that can leave a bot waiting: creating a game, a human's answer, loading a game from the
 * database. It is cheap to call again while a game is already running: one loop per game.
 */
export function playBots(game: IGame, delayMs: number = Number(process.env.BOT_DELAY_MS ?? DEFAULT_DELAY_MS)): void {
  if (!BotDriver.hasWaitingBot(game) || running.has(game.id)) {
    return;
  }
  running.add(game.id);
  loop(game.id, delayMs)
    .catch((e) => console.error(`Bots stopped in game ${game.id}:`, e))
    .finally(() => running.delete(game.id));
}

async function loop(gameId: GameId, delayMs: number): Promise<void> {
  const driver = new BotDriver();
  for (;;) {
    await sleep(delayMs);
    // Fetch the game every time: an undo replaces the cached game with a restored copy.
    const game = await GameLoader.getInstance().getGame(gameId);
    if (game === undefined || driver.step(game) === undefined) {
      return;
    }
  }
}
