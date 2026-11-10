import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {PreludeCard} from '../prelude/PreludeCard';
import {Tag} from '../../../common/cards/Tag';

export class LowOrbitFarms extends PreludeCard {
  constructor() {
    super({
      name: CardName.LOW_ORBIT_FARMS,
      tags: [Tag.PLANT, Tag.SPACE],
      behavior: {
        production: {megacredits: 1, plants: 1, titanium: 1},
      },
      metadata: {
        cardNumber: 'EP32',
        renderData: CardRenderer.builder((b) => {
          b.production((pb) => pb.megacredits(1).plants(1).titanium(1));
        }),
        description: 'Increase your M\u20ac, plant and titanium production 1 step.',
      },
    });
  }
}
