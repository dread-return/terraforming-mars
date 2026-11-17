import {CorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
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
          b.megacredits(38).br;
          b.effect('Whenever the temperature is raised, gain 1 M€ production per step.', (eb) => {
            eb.temperature(1, {all}).startEffect.production((pb) => pb.megacredits(1));
          });
        }),
      },
    });
  }
}
