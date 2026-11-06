import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';

export class InsectPollinators extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.INSECT_POLLINATORS,
      tags: [Tag.MICROBE],
      cost: 8,
      requirements: {oxygen: 4},

      metadata: {
        cardNumber: 'I17',
        renderData: CardRenderer.builder((b) => {
          b.effect('Placing a greenery from plants next to one of your other greeneries costs 1 plant less.', (eb) => {
            eb.greenery().greenery().startEffect.minus().plants(1);
          });
        }),
        description: 'Requires 4% oxygen.',
      },
    });
  }
}
