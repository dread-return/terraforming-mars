import {CorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';
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
        description: 'You start with 38 M€. First action: raise the oxygen 1 step.',
        renderData: CardRenderer.builder((b) => {
          b.br.br;
          b.megacredits(38).oxygen(1);
          b.corpBox('effect', (ce) => {
            ce.vSpace(Size.MEDIUM);
            ce.effect('When anyone raises the oxygen, gain 2 M€ per step, and 2 energy per step if it was you.', (eb) => {
              eb.oxygen(1, {all}).startEffect.megacredits(2).nbsp.energy(2).asterix();
            });
          });
        }),
      },
    });
  }
}
