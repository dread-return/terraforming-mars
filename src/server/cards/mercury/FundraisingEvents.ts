import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {ActCard} from '../../mercury/ActCard';
import {Tag} from '../../../common/cards/Tag';

export class FundraisingEvents extends ActCard {
  constructor() {
    super({
      name: CardName.FUNDRAISING_EVENTS,
      kind: 'treaty',
      steps: 6,
      tags: [Tag.EARTH],
      bothBehavior: {stock: {megacredits: 10}},
      metadata: {
        cardNumber: 'ACT28',
        renderData: CardRenderer.builder((b) => {
          b.megacredits(10);
        }),
        description: 'Resolve (both): gain 10 M€.',
      },
    });
  }
}
