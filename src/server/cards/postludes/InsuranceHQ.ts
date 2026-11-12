import {CardName} from '../../../common/cards/CardName';
import {CardType} from '../../../common/cards/CardType';
import {CardRenderer} from '../render/CardRenderer';
import {PostludeCard} from './PostludeCard';
import {Tag} from '../../../common/cards/Tag';
import {Size} from '../../../common/cards/render/Size';

export class InsuranceHQ extends PostludeCard {
  constructor() {
    super({
      name: CardName.INSURANCE_HQ,
      type: CardType.ACTIVE,
      cost: 5,
      tags: [Tag.EARTH],
      postludeKind: 'city',

      metadata: {
        cardNumber: 'L06',
        renderData: CardRenderer.builder((b) => {
          b.effect('When you lose a resource or production, get as many resources or productions (of that type) as the number of tiles adjacent to Insurance HQ.', (eb) => eb.minus().wild(1, {text: 'any'}).startEffect.plus().wild(1, {text: 'same'}).slash().emptyTile('normal', {size: Size.SMALL}).asterix());
        }),
        description: 'Place the Insurance HQ tile on top of one of your cities. Effect: when you lose a resource or production, get as many resources or productions of the same type as the number of tiles adjacent to Insurance HQ.',
      },
    });
  }
}
