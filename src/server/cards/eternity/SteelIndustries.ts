import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {PreludeCard} from '../prelude/PreludeCard';
import {Tag} from '../../../common/cards/Tag';

export class SteelIndustries extends PreludeCard {
  constructor() {
    super({
      name: CardName.STEEL_INDUSTRIES,
      tags: [Tag.BUILDING],
      behavior: {
        production: {megacredits: 2, steel: 1},
        stock: {megacredits: 2, steel: 2},
      },
      metadata: {
        cardNumber: 'EP55',
        renderData: CardRenderer.builder((b) => {
          b.production((pb) => pb.megacredits(2).steel(1)).megacredits(2).steel(2);
        }),
        description: 'Increase your M\u20ac production 2 steps and your steel production 1 step. Gain 2 M\u20ac and 2 steel.',
      },
    });
  }
}
