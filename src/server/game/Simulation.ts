import {Timer} from '../../common/Timer';

/**
 * Marks work done on throwaway copies of a game, such as a bot trying out its options.
 *
 * A copy has the same game id as the real game, so anything it saved would overwrite the real game in the database.
 * While a simulation is running, the game does not save, record results or touch the game loader.
 *
 * Simulations are synchronous. Nothing else runs while one is active, so a counter is enough.
 */
export class Simulation {
  private static depth = 0;

  private constructor() {}

  public static get active(): boolean {
    return Simulation.depth > 0;
  }

  public static run<T>(fn: () => T): T {
    Simulation.depth++;
    try {
      return Timer.preservingLastStop(fn);
    } finally {
      Simulation.depth--;
    }
  }
}
