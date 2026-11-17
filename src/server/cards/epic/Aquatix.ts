import {CorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';
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
        description: 'You start with 45 M€. First action: place an ocean tile.',
        renderData: CardRenderer.builder((b) => {
          b.br.br;
          b.megacredits(45).oceans(1);
          b.corpBox('effect', (ce) => {
            ce.vSpace(Size.SMALL);
            ce.effect(undefined, (eb) => {
              eb.oceans(1, {size: Size.SMALL, all}).startEffect.production((pb) => pb.megacredits(1));
            });
            ce.vSpace(Size.SMALL);
            ce.effect('When any ocean tile is placed, increase your M€ production 1 step. Your ocean requirements are +/-2 steps.', (eb) => {
              eb.empty().startEffect.oceans(1, {size: Size.SMALL}).text('req +/-2', {size: Size.SMALL});
            });
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
