import {DeferredAction} from '../deferredActions/DeferredAction';
import {Priority} from '../deferredActions/Priority';
import {IPlayer} from '../IPlayer';
import {CardResource} from '../../common/CardResource';
import {SelectCard} from '../inputs/SelectCard';
import {SelectAmount} from '../inputs/SelectAmount';
import {ICard} from '../cards/ICard';
import {PlayerInput} from '../PlayerInput';
import {sum} from '../../common/utils/utils';
import {message} from '../logs/MessageBuilder';

/**
 * Venus Phase 2: removes `count` resources of one type from any of `player`'s cards
 * (floaters paying for a Venus standard project, ore spent by a card action).
 * When there's a choice, the player picks the cards. The callback runs once all are removed.
 */
export class RemoveOwnCardResources extends DeferredAction {
  constructor(player: IPlayer, private readonly resource: CardResource, private remaining: number) {
    super(player, Priority.DEFAULT);
  }

  /** Total resources of `resource` on `player`'s cards. */
  public static total(player: IPlayer, resource: CardResource): number {
    return sum(player.getCardsWithResources(resource).map((card) => card.resourceCount));
  }

  private remove(card: ICard, count: number) {
    this.player.removeResourceFrom(card, count, {log: true});
    this.remaining -= count;
  }

  public execute(): PlayerInput | undefined {
    const cards = this.player.getCardsWithResources(this.resource);
    const total = sum(cards.map((card) => card.resourceCount));
    if (this.remaining <= 0 || total === 0) {
      this.cb(undefined);
      return undefined;
    }
    if (total <= this.remaining) {
      // Spend them all.
      cards.forEach((card) => this.remove(card, card.resourceCount));
      this.cb(undefined);
      return undefined;
    }
    if (cards.length === 1) {
      this.remove(cards[0], this.remaining);
      this.cb(undefined);
      return undefined;
    }
    return new SelectCard(
      message('Select a card to remove ${0} from (${1} left)', (b) => b.string(this.resource).number(this.remaining)),
      'Remove',
      cards)
      .andThen(([card]) => {
        const others = total - card.resourceCount;
        const min = Math.max(1, this.remaining - others);
        const max = Math.min(this.remaining, card.resourceCount);
        if (min === max) {
          this.remove(card, max);
          return this.execute();
        }
        return new SelectAmount(message('Number of ${0} to remove', (b) => b.string(this.resource)), 'Remove', min, max, true)
          .andThen((amount) => {
            this.remove(card, amount);
            return this.execute();
          });
      });
  }
}
