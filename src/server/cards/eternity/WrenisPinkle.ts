import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {CardType} from '../../../common/cards/CardType';
import {Card} from '../Card';
import {IProjectCard} from '../IProjectCard';

export class WrenisPinkle extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.EVENT,
      name: CardName.WRENIS_PINKLE,
      tags: [],
      cost: 0,
      behavior: {
        stock: {megacredits: 3},
      },
      metadata: {
        cardNumber: 'E143',
        renderData: CardRenderer.builder((b) => {
          b.text('ANNOUNCE THIS CARD PROUDLY:').megacredits(3);
        }),
        description: 'If you proudly announce that you are playing this card, gain 3 M\u20ac.',
      },
    });
  }
}
