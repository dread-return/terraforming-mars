import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {ActCard} from '../../mercury/ActCard';
import {Tag} from '../../../common/cards/Tag';
import {digit} from '../Options';

export class EngineeringPrograms extends ActCard {
  constructor() {
    super({
      name: CardName.ENGINEERING_PROGRAMS,
      kind: 'treaty',
      steps: 7,
      tags: [Tag.SCIENCE],
      bothBehavior: {drawCard: {count: 2, tag: Tag.BUILDING}, stock: {steel: 4}},
      metadata: {
        cardNumber: 'ACT20',
        renderData: CardRenderer.builder((b) => {
          b.cards(2, {secondaryTag: Tag.BUILDING}).steel(4, {digit});
        }),
        description: 'Resolve (both): draw 2 cards with a building tag. Gain 4 steel.',
      },
    });
  }
}
