import {CardName} from '../../../common/cards/CardName';
import {CardType} from '../../../common/cards/CardType';
import {Tag} from '../../../common/cards/Tag';
import {CardResource} from '../../../common/CardResource';
import {CardRenderer} from '../render/CardRenderer';
import {Card} from '../Card';
import {IProjectCard} from '../IProjectCard';

export class RareAsteroidHunting extends Card implements IProjectCard {
  constructor() {
    super({
      name: CardName.RARE_ASTEROID_HUNTING,
      type: CardType.EVENT,
      tags: [Tag.SPACE],
      cost: 14,
      behavior: {
        or: {
          behaviors: [
            {title: 'Increase your titanium production 1 step', production: {titanium: 1}},
            {title: 'Add 1 asteroid to any card and gain 1 titanium', addResourcesToAnyCard: {type: CardResource.ASTEROID, count: 1}, stock: {titanium: 1}},
          ],
        },
        addResourcesToAnyCard: {type: CardResource.FLOATER, count: 2},
      },
      metadata: {
        cardNumber: 'MM29',
        renderData: CardRenderer.builder((b) => {
          b.production((pb) => pb.titanium(1)).or().resource(CardResource.ASTEROID).asterix().titanium(1).br;
          b.resource(CardResource.FLOATER, 2).asterix();
        }),
        description: 'Increase your titanium production 1 step OR add 1 asteroid to any card and gain 1 titanium. Add 2 floaters to any card.',
      },
    });
  }
}
