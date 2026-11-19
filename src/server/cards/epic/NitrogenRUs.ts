import {CorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';

export class NitrogenRUs extends CorporationCard implements ICorporationCard {
  constructor() {
    super({
      name: CardName.NITROGEN_R_US,
      tags: [Tag.SPACE],
      startingMegaCredits: 50,

      behavior: {
        production: {titanium: 1},
      },

      metadata: {
        cardNumber: 'EP-NRU',
        description: 'You start with 50 M€ and 1 titanium production.',
        renderData: CardRenderer.builder((b) => {
          b.br.br;
          b.megacredits(50).production((pb) => pb.titanium(1));
          b.corpBox('effect', (ce) => {
            ce.vSpace(Size.MEDIUM);
            ce.effect('At any time (no action needed), you may pay 3 titanium to raise your TR 1 step.', (eb) => {
              eb.titanium(3).text('∞').startEffect.tr(1);
            });
          });
        }),
      },
    });
  }
  // The conversion is in EpicHooks.freeActionOption.
}
