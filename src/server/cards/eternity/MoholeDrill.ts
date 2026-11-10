import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {PreludeCard} from '../prelude/PreludeCard';
import {Tag} from '../../../common/cards/Tag';

export class MoholeDrill extends PreludeCard {
  constructor() {
    super({
      name: CardName.MOHOLE_DRILL,
      tags: [Tag.BUILDING, Tag.BUILDING],
      behavior: {
        production: {steel: 3},
      },
      metadata: {
        cardNumber: 'EP40',
        renderData: CardRenderer.builder((b) => {
          b.production((pb) => pb.steel(3));
        }),
        description: 'Increase your steel production 3 steps.',
      },
    });
  }
}
