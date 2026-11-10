import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {CardType} from '../../../common/cards/CardType';
import {PreludeCard} from '../prelude/PreludeCard';
import {Tag} from '../../../common/cards/Tag';

export class Stargazing extends PreludeCard {
  constructor() {
    super({
      name: CardName.STARGAZING,
      tags: [Tag.MARS],
      behavior: {
        stock: {megacredits: 14},
        drawCard: {count: 1, tag: Tag.SPACE, type: CardType.EVENT},
      },
      metadata: {
        cardNumber: 'EP54',
        renderData: CardRenderer.builder((b) => {
          b.megacredits(14).cards(1, {secondaryTag: Tag.SPACE}).asterix();
        }),
        description: 'Gain 14 M\u20ac. Reveal cards until you reveal a space event; take it and discard the rest.',
      },
    });
  }
}
