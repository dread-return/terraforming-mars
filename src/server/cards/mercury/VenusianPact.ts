import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {ActCard} from '../../mercury/ActCard';
import {Tag} from '../../../common/cards/Tag';

export class VenusianPact extends ActCard {
  constructor() {
    super({
      name: CardName.VENUSIAN_PACT,
      kind: 'treaty',
      steps: 6,
      tags: [Tag.VENUS],
      bothBehavior: {global: {venus: 1}, drawCard: {count: 1, tag: Tag.VENUS}},
      metadata: {
        cardNumber: 'ACT04',
        renderData: CardRenderer.builder((b) => {
          b.venus(1).cards(1, {secondaryTag: Tag.VENUS});
        }),
        description: 'Resolve (both): raise Venus 1 step. Draw 1 card with a Venus tag.',
      },
    });
  }
}
