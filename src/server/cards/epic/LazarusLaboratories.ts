import {CorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';

export class LazarusLaboratories extends CorporationCard implements ICorporationCard {
  constructor() {
    super({
      name: CardName.LAZARUS_LABORATORIES,
      tags: [Tag.SCIENCE],
      startingMegaCredits: 44,

      metadata: {
        cardNumber: 'EP-LZL',
        description: 'You start with 44 M€.',
        renderData: CardRenderer.builder((b) => {
          b.br.br;
          b.megacredits(44);
          b.corpBox('effect', (ce) => {
            ce.vSpace(Size.MEDIUM);
            ce.effect('After buying research cards, keep 1 of the cards you did not buy for free.', (eb) => {
              eb.plate('Research').startEffect.cards(1).text('free', {size: Size.SMALL});
            });
          });
        }),
      },
    });
  }
  // Effect is in ChooseCards (keepOneDiscardFree).
}
