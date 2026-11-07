import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardResource} from '../../../common/CardResource';
import {CardRenderer} from '../render/CardRenderer';

export class OxygenGardens extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.AUTOMATED,
      name: CardName.OXYGEN_GARDENS,
      tags: [Tag.SCIENCE, Tag.PLANT],
      cost: 17,
      behavior: {
        greenery: {},
        stock: {plants: 1},
        addResourcesToAnyCard: {type: CardResource.MICROBE, count: 1},
      },

      metadata: {
        cardNumber: 'N59',
        renderData: CardRenderer.builder((b) => {
          b.greenery().nbsp.plants(1).resource(CardResource.MICROBE).asterix();
        }),
        description: 'Place a greenery tile and raise oxygen 1 step. Gain 1 plant and add a microbe to ANY card.',
      },
    });
  }
}
