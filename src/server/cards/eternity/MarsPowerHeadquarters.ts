import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {CardType} from '../../../common/cards/CardType';
import {Card} from '../Card';
import {IProjectCard} from '../IProjectCard';
import {Tag} from '../../../common/cards/Tag';

export class MarsPowerHeadquarters extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.AUTOMATED,
      name: CardName.MARS_POWER_HEADQUARTERS,
      tags: [Tag.POWER, Tag.BUILDING],
      cost: 43,
      behavior: {
        production: {energy: 4, heat: 3},
        stock: {steel: 2},
      },
      metadata: {
        cardNumber: 'E85',
        renderData: CardRenderer.builder((b) => {
          b.production((pb) => pb.heat(3).br.energy(4)).steel(2);
        }),
        description: 'Increase your energy production 4 steps and your heat production 3 steps. Gain 2 steel.',
      },
    });
  }
}
