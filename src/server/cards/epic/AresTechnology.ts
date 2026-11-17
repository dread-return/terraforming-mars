import {CorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';

export class AresTechnology extends CorporationCard implements ICorporationCard {
  constructor() {
    super({
      name: CardName.ARES_TECHNOLOGY,
      tags: [Tag.EARTH],
      startingMegaCredits: 51,

      behavior: {
        production: {megacredits: 1},
      },

      firstAction: {
        text: 'Place 1 delegate',
        turmoil: {sendDelegates: {count: 1}},
      },

      metadata: {
        cardNumber: 'EP-ATE',
        description: 'You start with 51 M€ and 1 M€ production. First action: place 1 delegate.',
        renderData: CardRenderer.builder((b) => {
          b.br.br;
          b.megacredits(51).production((pb) => pb.megacredits(1)).delegates(1);
          b.corpBox('effect', (ce) => {
            ce.vSpace(Size.MEDIUM);
            ce.effect('Before the distant global event is revealed each generation, put the top 3 global events in any order.', (eb) => {
              eb.globalEvent().text('x3').startEffect.text('reorder');
            });
          });
        }),
      },
    });
  }
  // Effect is in EpicHooks.beforeTurmoilPhase.
}
