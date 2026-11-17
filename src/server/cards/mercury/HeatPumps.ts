import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {ActCard} from '../../mercury/ActCard';
import {Tag} from '../../../common/cards/Tag';

export class HeatPumps extends ActCard {
  constructor() {
    super({
      name: CardName.HEAT_PUMPS,
      kind: 'treaty',
      steps: 6,
      tags: [Tag.BUILDING, Tag.POWER],
      bothBehavior: {production: {energy: 1, heat: 1}},
      metadata: {
        cardNumber: 'ACT11',
        renderData: CardRenderer.builder((b) => {
          b.production((pb) => pb.energy(1).heat(1));
        }),
        description: 'Resolve (both): increase your energy and heat production 1 step.',
      },
    });
  }
}
