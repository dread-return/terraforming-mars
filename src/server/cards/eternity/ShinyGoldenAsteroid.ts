import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {PreludeCard} from '../prelude/PreludeCard';
import {Tag} from '../../../common/cards/Tag';

export class ShinyGoldenAsteroid extends PreludeCard {
  constructor() {
    super({
      name: CardName.SHINY_GOLDEN_ASTEROID,
      tags: [Tag.SPACE],
      behavior: {
        global: {temperature: 1},
        stock: {megacredits: 15},
      },
      metadata: {
        cardNumber: 'EP51',
        renderData: CardRenderer.builder((b) => {
          b.temperature(1).megacredits(15);
        }),
        description: 'Raise the temperature 1 step. Gain 15 M\u20ac.',
      },
    });
  }
}
