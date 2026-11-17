import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {PreludeCard} from '../prelude/PreludeCard';
import {digit} from '../Options';

export class MercurialMaterials extends PreludeCard {
  constructor() {
    super({
      name: CardName.MERCURIAL_MATERIALS,
      tags: [Tag.MERCURY],
      behavior: {
        stock: {megacredits: 5, steel: 5, titanium: 4},
      },
      metadata: {
        cardNumber: 'MMP02',
        renderData: CardRenderer.builder((b) => {
          b.megacredits(5).steel(5, {digit}).titanium(4, {digit});
        }),
        description: 'Gain 5 M€, 5 steel and 4 titanium.',
      },
    });
  }
}
