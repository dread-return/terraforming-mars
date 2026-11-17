import {CorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';

export class Harbinger extends CorporationCard implements ICorporationCard {
  constructor() {
    super({
      name: CardName.HARBINGER,
      tags: [Tag.JOVIAN],
      startingMegaCredits: 47,
      cardDiscount: {tag: Tag.JOVIAN, amount: 3},

      behavior: {
        colonies: {buildColony: {}},
      },

      metadata: {
        cardNumber: 'EP-HAR',
        description: 'You start with 47 M€ and place a colony.',
        renderData: CardRenderer.builder((b) => {
          b.megacredits(47).colonies(1).br;
          b.effect('When you play a Jovian tag, you pay 3 M€ less for it.', (eb) => {
            eb.tag(Tag.JOVIAN).startEffect.megacredits(-3);
          });
        }),
      },
    });
  }
}
