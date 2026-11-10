import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {PreludeCard} from '../prelude/PreludeCard';
import {Tag} from '../../../common/cards/Tag';

export class CrashingSpaceDebris extends PreludeCard {
  constructor() {
    super({
      name: CardName.CRASHING_SPACE_DEBRIS,
      tags: [Tag.SPACE],
      behavior: {
        tr: 2,
        stock: {titanium: 2},
      },
      metadata: {
        cardNumber: 'EP09',
        renderData: CardRenderer.builder((b) => {
          b.tr(2).titanium(2);
        }),
        description: 'Raise your TR 2 steps. Gain 2 titanium.',
      },
    });
  }
}
