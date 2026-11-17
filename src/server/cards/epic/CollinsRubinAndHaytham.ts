import {CorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';

export class CollinsRubinAndHaytham extends CorporationCard implements ICorporationCard {
  constructor() {
    super({
      name: CardName.COLLINS_RUBIN_AND_HAYTHAM,
      tags: [Tag.EARTH],
      startingMegaCredits: 58,
      cardCost: 2,

      metadata: {
        cardNumber: 'EP-CRH',
        description: 'You start with 58 M€.',
        renderData: CardRenderer.builder((b) => {
          b.br.br;
          b.megacredits(58);
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
