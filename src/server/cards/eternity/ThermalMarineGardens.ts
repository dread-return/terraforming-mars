import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {PreludeCard} from '../prelude/PreludeCard';
import {Tag} from '../../../common/cards/Tag';
import {digit} from '../Options';

export class ThermalMarineGardens extends PreludeCard {
  constructor() {
    super({
      name: CardName.THERMAL_MARINE_GARDENS,
      tags: [Tag.MARS, Tag.PLANT],
      behavior: {
        stock: {plants: 5, heat: 5, megacredits: 5},
        ocean: {},
        drawCard: 1,
      },
      metadata: {
        cardNumber: 'EP61',
        renderData: CardRenderer.builder((b) => {
          b.plants(5, {digit}).heat(5, {digit}).megacredits(5).br.oceans(1).cards(1);
        }),
        description: 'Gain 5 plants, 5 heat and 5 M\u20ac. Place an ocean tile. Draw a card.',
      },
    });
  }
}
