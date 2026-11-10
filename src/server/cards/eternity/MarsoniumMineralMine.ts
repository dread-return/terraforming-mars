import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {CardType} from '../../../common/cards/CardType';
import {Card} from '../Card';
import {IProjectCard} from '../IProjectCard';
import {Tag} from '../../../common/cards/Tag';

export class MarsoniumMineralMine extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.AUTOMATED,
      name: CardName.MARSONIUM_MINERAL_MINE,
      tags: [Tag.BUILDING],
      cost: 26,
      requirements: {tag: Tag.BUILDING, count: 2},
      behavior: {
        production: {steel: 1, plants: 1, heat: 1, energy: 1, titanium: 1},
      },
      metadata: {
        cardNumber: 'E86',
        renderData: CardRenderer.builder((b) => {
          b.production((pb) => pb.steel(1).plants(1).heat(1).energy(1).titanium(1));
        }),
        description: 'Requires 2 building tags. Increase your steel, plant, heat, energy and titanium production 1 step each.',
      },
    });
  }
}
