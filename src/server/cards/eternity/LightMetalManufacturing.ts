import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {PreludeCard} from '../prelude/PreludeCard';
import {Tag} from '../../../common/cards/Tag';

export class LightMetalManufacturing extends PreludeCard {
  constructor() {
    super({
      name: CardName.LIGHT_METAL_MANUFACTURING,
      tags: [Tag.BUILDING],
      behavior: {
        production: {megacredits: 1, heat: 1, steel: 1},
        stock: {megacredits: 1, heat: 1, steel: 1},
      },
      metadata: {
        cardNumber: 'EP31',
        renderData: CardRenderer.builder((b) => {
          b.production((pb) => pb.megacredits(1).heat(1).steel(1)).br.megacredits(1).heat(1).steel(1);
        }),
        description: 'Increase your M\u20ac, heat and steel production 1 step. Gain 1 M\u20ac, 1 heat and 1 steel.',
      },
    });
  }
}
