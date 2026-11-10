import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {PreludeCard} from '../prelude/PreludeCard';
import {Tag} from '../../../common/cards/Tag';

export class AcademicHoverInstitution extends PreludeCard {
  constructor() {
    super({
      name: CardName.ACADEMIC_HOVER_INSTITUTION,
      tags: [Tag.VENUS, Tag.SCIENCE],
      behavior: {
        global: {venus: 2},
        stock: {megacredits: 6},
      },
      metadata: {
        cardNumber: 'EP00',
        renderData: CardRenderer.builder((b) => {
          b.venus(2).megacredits(6);
        }),
        description: 'Raise Venus 2 steps. Gain 6 M\u20ac.',
      },
    });
  }
}
