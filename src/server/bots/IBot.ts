import {InputResponse} from '../../common/inputs/InputResponse';
import {IPlayer} from '../IPlayer';
import {PlayerInput} from '../PlayerInput';

/**
 * Something that can play a seat: given what the game is asking, answer it.
 *
 * `decide` returns the same JSON a browser would send, which `Player.process` validates exactly as it does for a human.
 * That gives every bot the engine's own rules check for free, and means a bot can only do what a human could.
 */
export interface IBot {
  /**
   * @param input what the player is waiting for.
   * @param player the seat to answer for.
   * @param attempt 0 the first time this input is answered. The driver asks again with a higher number when the
   * engine rejected the previous answer, so a bot may vary its answer (e.g. try another way to pay).
   */
  decide(input: PlayerInput, player: IPlayer, attempt: number): InputResponse;
}
