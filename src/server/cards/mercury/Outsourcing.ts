import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {ActCard} from '../../mercury/ActCard';
import {Size} from '../../../common/cards/render/Size';

export class Outsourcing extends ActCard {
  constructor() {
    super({
      name: CardName.OUTSOURCING,
      kind: 'rivalry',
      steps: 4,
      tags: [],
      metadata: {
        cardNumber: 'ACT48',
        renderData: CardRenderer.builder((b) => {
          b.text('victory:', {size: Size.SMALL}).text('use an active card of the defeated player', {size: Size.SMALL}).asterix();
        }),
        description: 'Victory: choose an active card of the defeated player. They cannot use its actions or effects next turn, but you can use it as your own. (Held out of the deck.)',
      },
    });
  }
}
