import {CardName} from '../../../common/cards/CardName';
import type {IGame} from '../../IGame';

/**
 * True when someone played Anti Fraud Investigation (Solaris) this generation: then no player can
 * remove another player's resources. Kept apart from the card so Player can import it.
 */
export function antiFraudActive(game: IGame): boolean {
  return game.players.some((p) => p.playedCards.get(CardName.ANTI_FRAUD_INVESTIGATION)?.generationUsed === game.generation);
}
