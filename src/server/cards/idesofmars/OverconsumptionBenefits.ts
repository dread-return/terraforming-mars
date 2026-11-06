import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';

export class OverconsumptionBenefits extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.AUTOMATED,
      name: CardName.OVERCONSUMPTION_BENEFITS,
      cost: 11,
      requirements: {tag: Tag.POWER, count: 2},

      behavior: {
        production: {heat: {cities: {where: 'onmars'}}},
      },

      metadata: {
        cardNumber: 'I53',
        renderData: CardRenderer.builder((b) => {
          b.production((pb) => pb.heat(1).slash().city());
        }),
        description: 'Requires 2 power tags. Increase your heat production 1 step for every city you own on Mars.',
      },
    });
  }
}
