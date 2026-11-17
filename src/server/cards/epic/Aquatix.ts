import {CorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {Space} from '../../boards/Space';
import {Board} from '../../boards/Board';
import {Resource} from '../../../common/Resource';
import {GlobalParameter} from '../../../common/GlobalParameter';
import {all} from '../Options';

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
        description: 'You start with 45 M€. As your first action, place an ocean tile.',
        renderData: CardRenderer.builder((b) => {
          b.megacredits(45).oceans(1).br;
          b.effect('Your ocean requirements are +2 or -2 steps, your choice in each case. When any ocean tile is placed, increase your M€ production 1 step.', (eb) => {
            eb.oceans(1, {all}).startEffect.production((pb) => pb.megacredits(1)).text('ocean req. +/-2');
          });
        }),
      },
    });
  }

  public onTilePlaced(cardOwner: IPlayer, _activePlayer: IPlayer, space: Space) {
    if (Board.isUncoveredOceanSpace(space)) {
      cardOwner.production.add(Resource.MEGACREDITS, 1, {log: true, from: {card: this}});
    }
  }
}
