import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {PreludeCard} from '../prelude/PreludeCard';
import {Tag} from '../../../common/cards/Tag';

export class Settlement extends PreludeCard {
  constructor() {
    super({
      name: CardName.SETTLEMENT,
      tags: [Tag.POWER, Tag.CITY],
      behavior: {
        city: {},
        production: {energy: 1},
        stock: {megacredits: 6},
      },
      metadata: {
        cardNumber: 'EP50',
        renderData: CardRenderer.builder((b) => {
          b.city().production((pb) => pb.energy(1)).megacredits(6);
        }),
        description: 'Place a city tile. Increase your energy production 1 step. Gain 6 M\u20ac.',
      },
    });
  }
}
