import {CorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';
import {digit} from '../Options';

export class ECMECorporation extends CorporationCard implements ICorporationCard {
  constructor() {
    super({
      name: CardName.ECME_CORPORATION,
      startingMegaCredits: 65,

      behavior: {
        production: {megacredits: 4},
      },

      metadata: {
        cardNumber: 'EP-ECM',
        description: 'You start with 65 M€ and 4 M€ production.',
        renderData: CardRenderer.builder((b) => {
          b.br.br;
          b.megacredits(65).production((pb) => pb.megacredits(4));
          b.corpBox('effect', (ce) => {
            ce.vSpace(Size.MEDIUM);
            ce.effect('In the production phase, after energy becomes heat, lose every base resource except M€. +1 temperature per 8 heat lost.', (eb) => {
              eb.heat(8, {digit}).asterix().startEffect.temperature(1);
            });
          });
        }),
      },
    });
  }
  // Effect is in EpicHooks.beforeProduction.
}
