import {ActiveCorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {Resource} from '../../../common/Resource';
import {SelectAmount} from '../../inputs/SelectAmount';

export class UnionAerospace extends ActiveCorporationCard implements ICorporationCard {
  constructor() {
    super({
      name: CardName.UNION_AEROSPACE,
      tags: [Tag.POWER],
      startingMegaCredits: 45,
      behavior: {
        production: {energy: 3},
      },
      action: {},

      metadata: {
        cardNumber: 'EP-UAC',
        description: 'You start with 3 energy production and 45 M€.',
        renderData: CardRenderer.builder((b) => {
          b.production((pb) => pb.energy(3)).megacredits(45).br;
          b.action('Spend any amount of energy to gain that amount plus 2 M€.', (eb) => {
            eb.text('X').energy(1).startAction.text('X+2').megacredits(1);
          });
        }),
      },
    });
  }

  public override bespokeCanAct(player: IPlayer) {
    return player.energy > 0;
  }

  public override bespokeAction(player: IPlayer) {
    return new SelectAmount('Select the amount of energy to spend', 'Spend energy', 1, player.energy, true).andThen((amount) => {
      player.stock.deduct(Resource.ENERGY, amount, {log: true});
      player.stock.add(Resource.MEGACREDITS, amount + 2, {log: true});
      return undefined;
    });
  }
}
