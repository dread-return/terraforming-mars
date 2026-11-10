import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {PreludeCard} from '../prelude/PreludeCard';
import {Tag} from '../../../common/cards/Tag';

export class OxygenatedAsteroid extends PreludeCard {
  constructor() {
    super({
      name: CardName.OXYGENATED_ASTEROID,
      tags: [Tag.SPACE],
      behavior: {
        global: {temperature: 1, oxygen: 1},
        stock: {steel: 1, titanium: 1},
      },
      metadata: {
        cardNumber: 'EP44',
        renderData: CardRenderer.builder((b) => {
          b.temperature(1).oxygen(1).steel(1).titanium(1);
        }),
        description: 'Raise the temperature 1 step and oxygen 1 step. Gain 1 steel and 1 titanium.',
      },
    });
  }
}
