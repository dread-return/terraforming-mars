import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {Resource} from '../../../common/Resource';

export class InfraredTherapy extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.EVENT,
      name: CardName.INFRARED_THERAPY,
      cost: 15,
      requirements: {production: Resource.HEAT, count: 4},
      victoryPoints: 2,
      reserveUnits: {steel: 1, titanium: 2},
      behavior: {
        stock: {heat: 4},
        tr: 2,
      },

      metadata: {
        cardNumber: 'N67',
        renderData: CardRenderer.builder((b) => {
          b.minus().steel(1).titanium(2).nbsp.heat(4).nbsp.tr(2);
        }),
        description: 'Requires that you have heat production of at least 4. Spend 1 steel and 2 titanium to gain 4 heat and raise your TR 2 steps.',
      },
    });
  }
}
