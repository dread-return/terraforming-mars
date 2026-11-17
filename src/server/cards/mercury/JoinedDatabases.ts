import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {ActCard} from '../../mercury/ActCard';
import {Tag} from '../../../common/cards/Tag';
import {CardResource} from '../../../common/CardResource';

export class JoinedDatabases extends ActCard {
  constructor() {
    super({
      name: CardName.JOINED_DATABASES,
      kind: 'treaty',
      steps: 7,
      tags: [Tag.BUILDING],
      bothBehavior: {drawCard: {count: 1, resource: CardResource.DATA}, addResourcesToAnyCard: {type: CardResource.DATA, count: 4}},
      metadata: {
        cardNumber: 'ACT07',
        renderData: CardRenderer.builder((b) => {
          b.cards(1).asterix().resource(CardResource.DATA, 4).asterix();
        }),
        description: 'Resolve (both): draw a card that uses or stores data. Add 4 data to any card.',
      },
    });
  }
}
