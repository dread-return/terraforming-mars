import {ActiveCorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {Resource} from '../../../common/Resource';
import {EpicUtils} from './EpicUtils';

export class ScolexIndustries extends ActiveCorporationCard implements ICorporationCard {
  constructor() {
    super({
      name: CardName.SCOLEX_INDUSTRIES,
      tags: [Tag.SCIENCE],
      startingMegaCredits: 50,
      behavior: {
        production: {energy: 1},
      },
      action: {},

      metadata: {
        cardNumber: 'EP-SCO',
        description: 'You start with 50 M€ and 1 energy production.',
        renderData: CardRenderer.builder((b) => {
          b.megacredits(50).production((pb) => pb.energy(1)).br;
          b.action('Reduce your energy production 1 step to increase any production 1 step.', (eb) => {
            eb.production((pb) => pb.minus().energy(1)).startAction.production((pb) => pb.wild(1));
          });
        }),
      },
    });
  }

  public override bespokeCanAct(player: IPlayer) {
    return player.production.energy >= 1;
  }

  public override bespokeAction(player: IPlayer) {
    player.production.add(Resource.ENERGY, -1, {log: true});
    return EpicUtils.gainAnyProduction(player, this);
  }
}
