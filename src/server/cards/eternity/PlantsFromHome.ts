import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {CardType} from '../../../common/cards/CardType';
import {Card} from '../Card';
import {IProjectCard} from '../IProjectCard';
import {Tag} from '../../../common/cards/Tag';

export class PlantsFromHome extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.AUTOMATED,
      name: CardName.PLANTS_FROM_HOME,
      tags: [Tag.EARTH, Tag.PLANT],
      cost: 4,
      behavior: {
        stock: {plants: 3},
      },
      metadata: {
        cardNumber: 'E102',
        renderData: CardRenderer.builder((b) => {
          b.plants(3);
        }),
        description: 'Gain 3 plants.',
      },
    });
  }
}
