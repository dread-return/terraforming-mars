import {CorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {all} from '../Options';

/** The effect lives in EpicHooks.onGlobalParameterIncrease. */
export class BarsoomianAtmospherics extends CorporationCard implements ICorporationCard {
  constructor() {
    super({
      name: CardName.BARSOOMIAN_ATMOSPHERICS,
      tags: [Tag.BUILDING],
      startingMegaCredits: 38,

      firstAction: {
        text: 'Raise the oxygen 1 step',
        global: {oxygen: 1},
      },

      metadata: {
        cardNumber: 'EP-BAA',
        description: 'You start with 38 M€. As your first action, raise the oxygen level 1 step.',
        renderData: CardRenderer.builder((b) => {
          b.megacredits(38).oxygen(1).br;
          b.effect('When ANY player raises the oxygen level, you gain 2 M€ per step. When YOU raise it, you also gain 2 energy per step.', (eb) => {
            eb.oxygen(1, {all}).startEffect.megacredits(2).nbsp.oxygen(1).colon().energy(2);
          });
        }),
      },
    });
  }
}
