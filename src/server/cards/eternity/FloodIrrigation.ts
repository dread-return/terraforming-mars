import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {PreludeCard} from '../prelude/PreludeCard';
import {Tag} from '../../../common/cards/Tag';
import {digit} from '../Options';

export class FloodIrrigation extends PreludeCard {
  constructor() {
    super({
      name: CardName.FLOOD_IRRIGATION,
      tags: [Tag.PLANT, Tag.MICROBE],
      behavior: {
        ocean: {},
        stock: {plants: 4, megacredits: 2},
      },
      metadata: {
        cardNumber: 'EP15',
        renderData: CardRenderer.builder((b) => {
          b.oceans(1).plants(4, {digit}).megacredits(2);
        }),
        description: 'Place an ocean tile. Gain 4 plants and 2 M\u20ac.',
      },
    });
  }
}
