import {ActiveCorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';

export class OmniConsumerProducts extends ActiveCorporationCard implements ICorporationCard {
  constructor() {
    super({
      name: CardName.OMNI_CONSUMER_PRODUCTS,
      tags: [Tag.EARTH],
      startingMegaCredits: 40,
      behavior: {
        production: {megacredits: 2},
      },

      action: {
        drawCard: {count: 1, pay: true},
      },

      metadata: {
        cardNumber: 'EP-OCP',
        description: 'You start with 40 M€ and 2 M€ production.',
        renderData: CardRenderer.builder((b) => {
          b.br.br;
          b.megacredits(40).production((pb) => pb.megacredits(2));
          b.corpBox('action', (ce) => {
            ce.vSpace(Size.MEDIUM);
            ce.action('Look at the top card of the deck and either buy it or discard it.', (eb) => {
              eb.empty().startAction.cards(1).asterix();
            });
          });
        }),
      },
    });
  }
}
