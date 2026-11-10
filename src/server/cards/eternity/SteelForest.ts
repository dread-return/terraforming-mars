import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {CardType} from '../../../common/cards/CardType';
import {Card} from '../Card';
import {IProjectCard} from '../IProjectCard';
import {Tag} from '../../../common/cards/Tag';

export class SteelForest extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.AUTOMATED,
      name: CardName.STEEL_FOREST,
      tags: [Tag.PLANT, Tag.BUILDING],
      cost: 12,
      requirements: {tag: Tag.BUILDING, count: 6},
      behavior: {
        greenery: {},
        production: {plants: 1, steel: 1},
        stock: {plants: 1, steel: 1},
      },
      metadata: {
        cardNumber: 'E122',
        renderData: CardRenderer.builder((b) => {
          b.greenery().production((pb) => pb.plants(1).steel(1)).plants(1).steel(1);
        }),
        description: 'Requires 6 building tags. Place a greenery. Increase your plant and steel production 1 step each. Gain a plant and a steel.',
      },
    });
  }
}
