import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {PreludeCard} from '../prelude/PreludeCard';
import {Tag} from '../../../common/cards/Tag';
import {digit} from '../Options';

export class MaterialResearch extends PreludeCard {
  constructor() {
    super({
      name: CardName.MATERIAL_RESEARCH,
      tags: [Tag.SCIENCE, Tag.BUILDING],
      behavior: {
        drawCard: 2,
        stock: {steel: 6},
      },
      metadata: {
        cardNumber: 'EP35',
        renderData: CardRenderer.builder((b) => {
          b.cards(2).steel(6, {digit});
        }),
        description: 'Draw 2 cards. Gain 6 steel.',
      },
    });
  }
}
