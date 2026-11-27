import {CorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';
import {GlobalParameter} from '../../../common/GlobalParameter';

export class Aquatix extends CorporationCard implements ICorporationCard {
  constructor() {
    super({
      name: CardName.AQUATIX,
      tags: [Tag.SCIENCE],
      startingMegaCredits: 45,
      globalParameterRequirementBonus: {steps: 2, parameter: GlobalParameter.OCEANS},

      firstAction: {
        text: 'Place an ocean tile',
        ocean: {},
      },

      metadata: {
        cardNumber: 'EP-AQX',
        description: 'You start with 45 M€. First action: place an ocean tile.',
        renderData: CardRenderer.builder((b) => {
          b.br.br;
          b.megacredits(45).oceans(1);
          b.br;
          b.effect(undefined, (eb) => {
            eb.oceans(1, {size: Size.SMALL}).startEffect.text('anywhere', {size: Size.SMALL}).asterix();
          }).br;
          b.effect('*You may place your oceans on any area, except next to 2 or more cities. Your ocean requirements are +/-2 steps.', (eb) => {
            eb.empty().startEffect.oceans(1, {size: Size.SMALL}).text('req +/-2', {size: Size.SMALL});
          }).br;
        }),
      },
    });
  }
  // Placement is in MarsBoard.getAvailableSpacesForOcean (EpicHooks.oceansOnLand).
}
