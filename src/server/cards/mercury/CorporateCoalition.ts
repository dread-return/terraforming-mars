import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {ActCard} from '../../mercury/ActCard';

export class CorporateCoalition extends ActCard {
  constructor() {
    super({
      name: CardName.CORPORATE_COALITION,
      kind: 'treaty',
      steps: 6,
      tags: [],
      metadata: {
        cardNumber: 'ACT18',
        renderData: CardRenderer.builder((b) => {
          b.corporation().asterix();
        }),
        description: 'Resolve: put 2 resource cubes on this card. During the production phase remove 1 cube; if you cannot, discard this card. As long as this card is in game, you can both use the effects and actions of each other\'s corporations as your own. (Held out of the deck.)',
      },
    });
  }
}
