import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {ActCard} from '../../mercury/ActCard';

export class VolcanicActivityResearch extends ActCard {
  constructor() {
    super({
      name: CardName.VOLCANIC_ACTIVITY_RESEARCH,
      kind: 'treaty',
      steps: 7,
      tags: [],
      bothBehavior: {production: {heat: 3}},
      metadata: {
        cardNumber: 'ACT23',
        renderData: CardRenderer.builder((b) => {
          b.production((pb) => pb.heat(3));
        }),
        description: 'Resolve (both): increase your heat production 3 steps.',
      },
    });
  }
}
