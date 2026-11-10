import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {CardType} from '../../../common/cards/CardType';
import {Card} from '../Card';
import {IProjectCard} from '../IProjectCard';
import {Tag} from '../../../common/cards/Tag';
import {all} from '../Options';

export class DoubleTailedAsteroid extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.EVENT,
      name: CardName.DOUBLE_TAILED_ASTEROID,
      tags: [Tag.SPACE, Tag.EVENT],
      cost: 19,
      behavior: {
        ocean: {on: 'land'},
        stock: {titanium: 3},
        removeAnyPlants: 2,
      },
      metadata: {
        cardNumber: 'E65',
        renderData: CardRenderer.builder((b) => {
          b.oceans(1).asterix().titanium(3).minus().plants(2, {all});
        }),
        description: 'Place an ocean tile on an area NOT reserved for oceans. Gain 3 titanium. Remove up to 2 plants from any player.',
      },
    });
  }
}
