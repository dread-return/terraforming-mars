import {CorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';

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
          b.br.br;
          b.megacredits(47).colonies(1);
          b.corpBox('effect', (ce) => {
            ce.vSpace(Size.MEDIUM);
            ce.effect('When you play a Jovian tag, you pay 3 M€ less for it.', (eb) => {
              eb.tag(Tag.JOVIAN).startEffect.megacredits(-3);
            });
          });
        }),
      },
    });
  }
}
