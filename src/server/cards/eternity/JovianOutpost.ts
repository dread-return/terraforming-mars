import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {PreludeCard} from '../prelude/PreludeCard';
import {Tag} from '../../../common/cards/Tag';

export class JovianOutpost extends PreludeCard {
  constructor() {
    super({
      name: CardName.JOVIAN_OUTPOST,
      tags: [Tag.SPACE, Tag.JOVIAN],
      victoryPoints: {tag: Tag.JOVIAN, per: 2},
      behavior: {
        production: {titanium: 1},
        stock: {titanium: 1},
      },
      metadata: {
        cardNumber: 'EP29',
        renderData: CardRenderer.builder((b) => {
          b.production((pb) => pb.titanium(1)).titanium(1);
        }),
        description: 'Increase your titanium production 1 step. Gain 1 titanium. 1 VP per 2 Jovian tags you have.',
      },
    });
  }
}
