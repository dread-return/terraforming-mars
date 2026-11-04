import {IPlayer} from '../../IPlayer';
import {IProjectCard} from '../IProjectCard';
import {SelectCard} from '../../inputs/SelectCard';
import {ICard} from '../ICard';

/**
 * A set of revealed project cards that players take turns picking from.
 *
 * Each pick is deferred, so every picker sees what is left after the picks before theirs.
 */
export class CardPool {
  constructor(private readonly cards: Array<IProjectCard>, private readonly source: ICard) {}

  /** Defers a choice for `player` to keep `count` cards from what is left. */
  public offer(player: IPlayer, count: number) {
    player.defer(() => {
      if (this.cards.length === 0) {
        return undefined;
      }
      const max = Math.min(count, this.cards.length);
      return new SelectCard(`Select ${max} card(s) to keep`, 'Keep', this.cards, {min: max, max: max})
        .andThen((selected) => {
          for (const card of selected) {
            this.remove(card);
            player.cardsInHand.push(card);
          }
          player.game.log('${0} kept ${1} card(s) from ${2}', (b) => b.player(player).number(selected.length).card(this.source));
          return undefined;
        });
    });
  }

  /** Gives `cards` straight to `player`. */
  public give(player: IPlayer, cards: ReadonlyArray<IProjectCard>) {
    for (const card of cards) {
      this.remove(card);
      player.cardsInHand.push(card);
    }
  }

  /** Defers discarding whatever is left, after all the deferred picks. */
  public discardRest(player: IPlayer) {
    player.defer(() => {
      const game = player.game;
      for (const card of this.cards) {
        game.projectDeck.discard(card);
      }
      this.cards.length = 0;
      return undefined;
    });
  }

  public get remaining(): ReadonlyArray<IProjectCard> {
    return this.cards;
  }

  private remove(card: IProjectCard) {
    const idx = this.cards.findIndex((c) => c.name === card.name);
    if (idx >= 0) {
      this.cards.splice(idx, 1);
    }
  }
}
