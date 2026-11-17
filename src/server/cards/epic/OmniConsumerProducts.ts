import {CorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';

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
          b.megacredits(40).production((pb) => pb.megacredits(2)).br;
          b.effect('Pay only 2 M€ to keep each card during the research phase.', (eb) => {
            eb.cards(1).asterix().startEffect.megacredits(2);
          });
        }),
      },
    });
  }
}
