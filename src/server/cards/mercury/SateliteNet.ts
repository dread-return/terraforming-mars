import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {ActCard} from '../../mercury/ActCard';
import {Tag} from '../../../common/cards/Tag';
import {CardResource} from '../../../common/CardResource';

export class SateliteNet extends ActCard {
  constructor() {
    super({
      name: CardName.SATELITE_NET,
      kind: 'treaty',
      steps: 7,
      tags: [Tag.SPACE],
      bothBehavior: {drawCard: {count: 2, tag: Tag.SPACE}, or: {behaviors: [{title: 'Add 2 data to any card', addResourcesToAnyCard: {type: CardResource.DATA, count: 2}}, {title: 'Add 1 asteroid to any card', addResourcesToAnyCard: {type: CardResource.ASTEROID, count: 1}}]}},
      metadata: {
        cardNumber: 'ACT31',
        renderData: CardRenderer.builder((b) => {
          b.cards(2, {secondaryTag: Tag.SPACE}).br;
          b.resource(CardResource.DATA, 2).asterix().or().resource(CardResource.ASTEROID).asterix();
        }),
        description: 'Resolve (both): draw 2 cards with a space tag. Add 2 data OR 1 asteroid to any card.',
      },
    });
  }
}
