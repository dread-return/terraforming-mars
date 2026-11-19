import {CorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';
import {all} from '../Options';

/** The effect lives in EpicHooks.onGlobalParameterIncrease. */
export class PlanetaryHomeostasisBureau extends CorporationCard implements ICorporationCard {
  constructor() {
    super({
      name: CardName.PLANETARY_HOMEOSTASIS_BUREAU,
      tags: [],
      startingMegaCredits: 38,

      metadata: {
        cardNumber: 'EP-PHB',
        description: 'You start with 38 M€.',
        renderData: CardRenderer.builder((b) => {
          b.br.br;
          b.megacredits(38);
          b.corpBox('effect', (ce) => {
            ce.vSpace(Size.MEDIUM);
            ce.effect('When anyone raises the temperature, increase your M€ production 1 step per step.', (eb) => {
              eb.temperature(1, {all}).startEffect.production((pb) => pb.megacredits(1));
            });
          });
        }),
      },
    });
  }
}
