import {CorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';
import {all} from '../Options';

export class SolarEnterprises extends CorporationCard implements ICorporationCard {
  constructor() {
    super({
      name: CardName.SOLAR_ENTERPRISES,
      tags: [Tag.SPACE],
      startingMegaCredits: 42,

      metadata: {
        cardNumber: 'EP-SOE',
        description: 'You start with 42 M€.',
        renderData: CardRenderer.builder((b) => {
          b.br.br;
          b.megacredits(42);
          b.corpBox('effect', (ce) => {
            ce.vSpace(Size.SMALL);
            ce.effect(undefined, (eb) => {
              eb.trade({all}).startEffect.megacredits(1);
            });
            ce.vSpace(Size.SMALL);
            ce.effect('Any trade: +1 M€. Your trade: +1 M€ per step the track is above its colonies.', (eb) => {
              eb.trade().startEffect.megacredits(1).slash().text('step', {size: Size.SMALL});
            });
          });
        }),
      },
    });
  }
  // Effect is in EpicHooks.onTrade.
}
