import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {PreludeCard} from '../prelude/PreludeCard';
import {digit} from '../Options';

export class FlyingSupplies extends PreludeCard {
  constructor() {
    super({
      name: CardName.FLYING_SUPPLIES,
      tags: [],
      behavior: {
        stock: {megacredits: 4, titanium: 4, steel: 4},
      },
      metadata: {
        cardNumber: 'EP18',
        renderData: CardRenderer.builder((b) => {
          b.megacredits(4).titanium(4, {digit}).steel(4, {digit});
        }),
        description: 'Gain 4 M\u20ac, 4 titanium and 4 steel.',
      },
    });
  }
}
