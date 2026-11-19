import {CorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';

export class Lorean extends CorporationCard implements ICorporationCard {
  constructor() {
    super({
      name: CardName.LOREAN,
      tags: [Tag.SCIENCE],
      startingMegaCredits: 43,
      globalParameterRequirementBonus: {steps: 1},

      metadata: {
        cardNumber: 'EP-LOR',
        description: 'You start with 43 M€.',
        renderData: CardRenderer.builder((b) => {
          b.br.br;
          b.megacredits(43);
          b.corpBox('effect', (ce) => {
            ce.vSpace(Size.SMALL);
            ce.effect(undefined, (eb) => {
              eb.text('max', {size: Size.SMALL}).asterix().startEffect.text('ignore', {size: Size.SMALL});
            });
            ce.vSpace(Size.SMALL);
            ce.effect('You may ignore maximum requirements. Your global requirements are +1 or -1 step.', (eb) => {
              eb.temperature(1).oxygen(1).oceans(1, {size: Size.SMALL}).venus(1).startEffect.text('+/-1');
            });
          });
        }),
      },
    });
  }
  // Maximum requirements are in EpicHooks.ignoresMaxRequirement.
}
