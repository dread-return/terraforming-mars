import {CorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';

export class OmniConsumerProducts extends CorporationCard implements ICorporationCard {
  constructor() {
    super({
      name: CardName.OMNI_CONSUMER_PRODUCTS,
      tags: [Tag.WILD],
      startingMegaCredits: 40,
      cardCost: 2,
      behavior: {
        production: {megacredits: 2},
      },

      metadata: {
        cardNumber: 'EP-OCP',
        description: 'You start with 40 M€ and 2 M€ production.',
        renderData: CardRenderer.builder((b) => {
          b.br.br;
          b.megacredits(40).production((pb) => pb.megacredits(2));
          b.corpBox('effect', (ce) => {
            ce.vSpace(Size.MEDIUM);
            ce.effect('You pay 2 M€ instead of 3 M€ for each card you buy, including your starting cards.', (eb) => {
              eb.cards(1).asterix().startEffect.megacredits(2);
            });
          });
        }),
      },
    });
  }
}
