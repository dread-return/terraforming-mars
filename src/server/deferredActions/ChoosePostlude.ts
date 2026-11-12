import {inplaceRemove} from '../../common/utils/utils';
import {POSTLUDE_DRAW_COUNT} from '../../common/postludes/Postludes';
import {IProjectCard} from '../cards/IProjectCard';
import {SelectCard} from '../inputs/SelectCard';
import {IPlayer} from '../IPlayer';
import {DeferredAction} from './DeferredAction';
import {Priority} from './Priority';

/** Draw four postludes, keep one in hand and discard the rest. */
export class ChoosePostlude extends DeferredAction<IProjectCard | undefined> {
  constructor(player: IPlayer) {
    super(player, Priority.DEFAULT);
  }

  public execute() {
    const game = this.player.game;
    const deck = game.postludes?.deck;
    if (deck === undefined) {
      this.cb(undefined);
      return undefined;
    }
    const cards = deck.drawN(game, POSTLUDE_DRAW_COUNT);
    if (cards.length === 0) {
      game.log('${0} gained a postlude, but the postlude deck is empty', (b) => b.player(this.player));
      this.cb(undefined);
      return undefined;
    }
    return new SelectCard('Select a postlude to keep', 'Keep', cards)
      .andThen(([card]) => {
        inplaceRemove(cards, card);
        deck.discard(...cards);
        this.player.cardsInHand.push(card);
        game.log('${0} kept a postlude', (b) => b.player(this.player), {reservedFor: this.player});
        this.cb(card);
        return undefined;
      });
  }
}
