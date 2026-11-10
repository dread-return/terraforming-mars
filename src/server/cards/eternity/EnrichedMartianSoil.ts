import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {PreludeCard} from '../prelude/PreludeCard';
import {Tag} from '../../../common/cards/Tag';

export class EnrichedMartianSoil extends PreludeCard {
  constructor() {
    super({
      name: CardName.ENRICHED_MARTIAN_SOIL,
      tags: [Tag.MARS],
      victoryPoints: {tag: Tag.MARS},
      behavior: {
        stock: {megacredits: 6},
        drawCard: {count: 1, tag: Tag.MARS},
      },
      metadata: {
        cardNumber: 'EP14',
        renderData: CardRenderer.builder((b) => {
          b.cards(1, {secondaryTag: Tag.MARS}).megacredits(6);
        }),
        description: 'Gain 6 M\u20ac. Reveal cards until you reveal a Mars card; take it and discard the rest. 1 VP per Mars tag you have.',
      },
    });
  }
}
