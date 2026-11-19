import {ActiveCorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';

export class PolitiCorp extends ActiveCorporationCard implements ICorporationCard {
  constructor() {
    super({
      name: CardName.POLITICORP,
      tags: [Tag.EARTH],
      startingMegaCredits: 40,

      behavior: {
        turmoil: {influenceBonus: 1},
      },

      firstAction: {
        text: 'Place 2 delegates',
        turmoil: {sendDelegates: {count: 2, manyParties: true}},
      },

      action: {
        spend: {megacredits: 2},
        turmoil: {sendDelegates: {count: 1}},
      },

      metadata: {
        cardNumber: 'EP-POL',
        description: 'You start with 40 M€ and +1 influence. First action: place 2 delegates.',
        renderData: CardRenderer.builder((b) => {
          b.br.br;
          b.megacredits(40).influence().delegates(2);
          b.corpBox('action', (ce) => {
            ce.vSpace(Size.MEDIUM);
            ce.action('Spend 2 M€ to place 1 delegate.', (eb) => {
              eb.megacredits(2).startAction.delegates(1);
            });
          });
        }),
      },
    });
  }
}
