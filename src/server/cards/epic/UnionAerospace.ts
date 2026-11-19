import {ActiveCorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';
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
          b.br.br;
          b.production((pb) => pb.energy(3)).nbsp.megacredits(45);
          b.corpBox('action', (ce) => {
            ce.vSpace(Size.MEDIUM);
            ce.action('Spend any amount of energy to gain that much M€ plus 2.', (eb) => {
              eb.text('x').energy(1).startAction.megacredits(1, {text: 'x+2'});
            });
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
