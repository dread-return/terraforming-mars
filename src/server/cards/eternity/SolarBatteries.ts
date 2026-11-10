import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {PreludeCard} from '../prelude/PreludeCard';
import {Tag} from '../../../common/cards/Tag';

export class SolarBatteries extends PreludeCard {
  constructor() {
    super({
      name: CardName.SOLAR_BATTERIES,
      tags: [Tag.POWER],
      behavior: {
        production: {energy: 1},
        global: {temperature: 1},
        stock: {megacredits: 8},
      },
      metadata: {
        cardNumber: 'EP53',
        renderData: CardRenderer.builder((b) => {
          b.production((pb) => pb.energy(1)).temperature(1).megacredits(8);
        }),
        description: 'Increase your energy production 1 step. Raise the temperature 1 step. Gain 8 M\u20ac.',
      },
    });
  }
}
