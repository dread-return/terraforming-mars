import {CardName} from '../../../common/cards/CardName';
import {CardType} from '../../../common/cards/CardType';
import {CardRenderer} from '../render/CardRenderer';
import {PostludeCard} from './PostludeCard';
import {Tag} from '../../../common/cards/Tag';
import {IActionCard} from '../ICard';
import {IPlayer} from '../../IPlayer';
import {SelectCard} from '../../inputs/SelectCard';
import {inplaceRemove} from '../../../common/utils/utils';

export class MarsCasino extends PostludeCard implements IActionCard {
  constructor() {
    super({
      name: CardName.MARS_CASINO,
      type: CardType.ACTIVE,
      cost: 4,
      tags: [Tag.MARS, Tag.BUILDING],
      postludeKind: 'city',

      metadata: {
        cardNumber: 'L08',
        renderData: CardRenderer.builder((b) => {
          b.action('Draw a card for each tile of yours adjacent to the Casino, and reveal and discard one card. Keep a card that costs more than the discarded card. Discard the rest.', (ab) => ab.empty().startAction.cards(1, {text: 'x'}).asterix().cards(1, {secondaryTag: Tag.EVENT}).text('>'));
        }),
        description: 'Place the Casino tile on top of one of your cities. Action: draw a card for each tile of yours adjacent to the Casino, and discard one card from the deck. Keep a drawn card that costs more than the discarded card. Discard the rest.',
      },
    });
  }

  public canAct(player: IPlayer): boolean {
    return this.ownAdjacentTiles(player).length > 0;
  }

  public action(player: IPlayer) {
    const game = player.game;
    const deck = game.projectDeck;
    const drawn = deck.drawN(game, this.ownAdjacentTiles(player).length);
    const revealed = deck.draw(game);
    let threshold = -1;
    if (revealed !== undefined) {
      threshold = revealed.cost;
      deck.discard(revealed);
      game.log('${0} revealed and discarded ${1}', (b) => b.player(player).card(revealed));
    }
    const keepable = drawn.filter((card) => card.cost > threshold);
    if (keepable.length === 0) {
      deck.discard(...drawn);
      game.log('${0} found nothing to keep at ${1}', (b) => b.player(player).card(this));
      return undefined;
    }
    return new SelectCard('Select a card to keep', 'Keep', keepable)
      .andThen(([card]) => {
        inplaceRemove(drawn, card);
        deck.discard(...drawn);
        player.cardsInHand.push(card);
        game.log('${0} kept a card from ${1}', (b) => b.player(player).card(this), {reservedFor: player});
        return undefined;
      });
  }
}
