import {ActiveCorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {Resource} from '../../../common/Resource';
import {SelectAmount} from '../../inputs/SelectAmount';

export class Forj extends ActiveCorporationCard implements ICorporationCard {
  constructor() {
    super({
      name: CardName.FORJ,
      tags: [Tag.BUILDING],
      startingMegaCredits: 45,
      behavior: {
        production: {heat: 1, steel: 1},
      },
      action: {},

      metadata: {
        cardNumber: 'EP-FOR',
        description: 'You start with 45 M€, 1 heat production and 1 steel production.',
        renderData: CardRenderer.builder((b) => {
          b.megacredits(45).production((pb) => pb.heat(1).steel(1)).br;
          b.action('Pay X steel and 1 heat to gain X titanium.', (eb) => {
            eb.text('X').steel(1).heat(1).startAction.text('X').titanium(1);
          });
        }),
      },
    });
  }

  public override bespokeCanAct(player: IPlayer) {
    return player.steel > 0 && player.heat > 0;
  }

  public override bespokeAction(player: IPlayer) {
    return new SelectAmount('Select the amount of steel to convert', 'Convert', 1, player.steel, true).andThen((amount) => {
      player.stock.deduct(Resource.STEEL, amount, {log: true});
      player.stock.deduct(Resource.HEAT, 1, {log: true});
      player.stock.add(Resource.TITANIUM, amount, {log: true});
      return undefined;
    });
  }
}
