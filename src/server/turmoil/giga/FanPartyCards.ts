import {GIGA_PARTIES, PartyName} from '../../../common/turmoil/PartyName';
import {IGame} from '../../IGame';
import {ICard} from '../../cards/ICard';
import {IProjectCard} from '../../cards/IProjectCard';

/**
 * The GIGA fan-party cards (Rob Antilles, Solaris and Ides of Mars cards that need Spome, Bureaucrats,
 * Empower, Populists, Centrists or Transhumanists).
 *
 * They are only in games with Giga Turmoil (`gigaTurmoil` in their manifest entry). Once the party draft
 * has chosen the six parties in play, the cards whose party was not drafted leave the game: they are
 * taken out of the deck, and a player holding one discards it and draws a replacement (the GIGA
 * "discard and redraw" rule, Leo's choice on 2026-11-18).
 */
export class FanPartyCards {
  private constructor() {}

  /** The GIGA fan party `card` requires, if any. */
  public static fanPartyOf(card: ICard): PartyName | undefined {
    for (const requirement of card.requirements) {
      if (requirement.party !== undefined && GIGA_PARTIES.includes(requirement.party)) {
        return requirement.party;
      }
    }
    return undefined;
  }

  /** True when `card` needs a GIGA fan party that is not in this game. */
  public static isOutOfPlay(game: IGame, card: ICard): boolean {
    const party = this.fanPartyOf(card);
    return party !== undefined && game.turmoil?.isInPlay(party) !== true;
  }

  /**
   * Called when the party draft is over: removes the cards whose party was not drafted from the
   * project deck and replaces the ones in players' hands.
   */
  public static removeAbsentPartyCards(game: IGame): void {
    const deck = game.projectDeck;
    const outOfPlay = (card: IProjectCard) => this.isOutOfPlay(game, card);
    const removed = deck.drawPile.filter(outOfPlay).length + deck.discardPile.filter(outOfPlay).length;
    deck.drawPile = deck.drawPile.filter((card) => !outOfPlay(card));
    deck.discardPile = deck.discardPile.filter((card) => !outOfPlay(card));
    if (removed > 0) {
      game.log('${0} cards for parties not in play were removed from the deck', (b) => b.number(removed));
    }

    for (const player of game.players) {
      const swapped = player.cardsInHand.filter(outOfPlay);
      for (const card of swapped) {
        const index = player.cardsInHand.indexOf(card);
        const replacement = deck.draw(game);
        if (replacement === undefined) {
          player.cardsInHand.splice(index, 1);
        } else {
          player.cardsInHand.splice(index, 1, replacement);
        }
        game.log('${0} discarded ${1} (its party is not in play) and drew a replacement',
          (b) => b.player(player).card(card), {reservedFor: player});
      }
    }
  }
}
