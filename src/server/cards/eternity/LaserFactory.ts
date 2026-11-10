import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {PreludeCard} from '../prelude/PreludeCard';
import {Tag} from '../../../common/cards/Tag';

export class LaserFactory extends PreludeCard {
  constructor() {
    super({
      name: CardName.LASER_FACTORY,
      tags: [Tag.SPACE],
      behavior: {
        production: {titanium: 1, heat: 2},
      },
      metadata: {
        cardNumber: 'EP30',
        renderData: CardRenderer.builder((b) => {
          b.production((pb) => pb.titanium(1).heat(2));
        }),
        description: 'Increase your titanium production 1 step. Increase your heat production 2 steps.',
      },
    });
  }
}
