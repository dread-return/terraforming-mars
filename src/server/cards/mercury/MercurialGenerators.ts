import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {PreludeCard} from '../prelude/PreludeCard';

export class MercurialGenerators extends PreludeCard {
  constructor() {
    super({
      name: CardName.MERCURIAL_GENERATORS,
      tags: [Tag.BUILDING, Tag.POWER, Tag.MERCURY],
      behavior: {
        production: {energy: 2, heat: 2},
      },
      metadata: {
        cardNumber: 'MMP01',
        renderData: CardRenderer.builder((b) => {
          b.production((pb) => pb.energy(2).heat(2));
        }),
        description: 'Increase your energy and heat production 2 steps.',
      },
    });
  }
}
