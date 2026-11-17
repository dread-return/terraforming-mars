import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {ActCard} from '../../mercury/ActCard';
import {Tag} from '../../../common/cards/Tag';
import {Size} from '../../../common/cards/render/Size';

export class ErisExpedition extends ActCard {
  constructor() {
    super({
      name: CardName.ERIS_EXPEDITION,
      kind: 'rivalry',
      steps: 5,
      tags: [Tag.SCIENCE, Tag.SCIENCE, Tag.SCIENCE],
      victoryBehavior: {drawCard: 2},
      metadata: {
        cardNumber: 'ACT52',
        renderData: CardRenderer.builder((b) => {
          b.text('victory:', {size: Size.SMALL}).cards(2);
        }),
        description: 'Victory: draw 2 cards.',
      },
    });
  }
}
