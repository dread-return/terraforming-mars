import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {ActCard} from '../../mercury/ActCard';
import {Tag} from '../../../common/cards/Tag';
import {digit} from '../Options';
import {CardResource} from '../../../common/CardResource';

export class AsteroidMiningMvM extends ActCard {
  constructor() {
    super({
      name: CardName.ASTEROID_MINING_MVM,
      kind: 'treaty',
      steps: 7,
      tags: [Tag.SPACE],
      bothBehavior: {or: {behaviors: [{title: 'Add 2 asteroids to any card', addResourcesToAnyCard: {type: CardResource.ASTEROID, count: 2}}, {title: 'Gain 4 titanium', stock: {titanium: 4}}]}},
      metadata: {
        cardNumber: 'ACT12',
        renderData: CardRenderer.builder((b) => {
          b.resource(CardResource.ASTEROID, 2).asterix().or().titanium(4, {digit});
        }),
        description: 'Resolve (both): add 2 asteroids to any card OR gain 4 titanium.',
      },
    });
  }
}
