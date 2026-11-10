import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {PreludeCard} from '../prelude/PreludeCard';
import {Tag} from '../../../common/cards/Tag';

export class SmallTown extends PreludeCard {
  constructor() {
    super({
      name: CardName.SMALL_TOWN,
      tags: [Tag.BUILDING, Tag.CITY],
      behavior: {
        city: {},
        tr: 1,
      },
      metadata: {
        cardNumber: 'EP52',
        renderData: CardRenderer.builder((b) => {
          b.city().tr(1);
        }),
        description: 'Place a city tile. Raise your TR 1 step.',
      },
    });
  }
}
