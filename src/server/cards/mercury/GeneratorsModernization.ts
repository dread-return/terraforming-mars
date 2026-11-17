import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {ActCard} from '../../mercury/ActCard';
import {Tag} from '../../../common/cards/Tag';

export class GeneratorsModernization extends ActCard {
  constructor() {
    super({
      name: CardName.GENERATORS_MODERNIZATION,
      kind: 'treaty',
      steps: 7,
      tags: [Tag.POWER],
      bothBehavior: {production: {energy: 1}, stock: {energy: 3}},
      metadata: {
        cardNumber: 'ACT10',
        renderData: CardRenderer.builder((b) => {
          b.production((pb) => pb.energy(1)).energy(3);
        }),
        description: 'Resolve (both): increase your energy production 1 step and gain 3 energy.',
      },
    });
  }
}
