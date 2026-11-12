import {CardName} from '../../../common/cards/CardName';
import {CardType} from '../../../common/cards/CardType';
import {CardRenderer} from '../render/CardRenderer';
import {PostludeCard} from './PostludeCard';
import {Tag} from '../../../common/cards/Tag';
import {Size} from '../../../common/cards/render/Size';

export class AstroUniversity extends PostludeCard {
  constructor() {
    super({
      name: CardName.ASTRO_UNIVERSITY,
      type: CardType.ACTIVE,
      cost: 10,
      tags: [Tag.EARTH],
      postludeKind: 'city',
      requirements: {tag: Tag.SCIENCE, count: 3},

      metadata: {
        cardNumber: 'L01',
        renderData: CardRenderer.builder((b) => {
          b.effect('Cities 2 or less tiles distant from this tile gain 1 additional VP per adjacent greenery.', (eb) => eb.city({size: Size.SMALL}).asterix().startEffect.vpText('+1/').greenery({size: Size.SMALL}));
        }),
        description: 'Requires 3 science tags. Place the Astro-University tile on top of one of your cities. Cities 2 or less tiles distant from Astro-University (itself included) gain 1 additional VP per adjacent greenery.',
      },
    });
  }
}
