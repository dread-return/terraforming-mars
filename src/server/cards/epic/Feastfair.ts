import {ActiveCorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {Resource} from '../../../common/Resource';
import {SelectAmount} from '../../inputs/SelectAmount';

export class Feastfair extends ActiveCorporationCard implements ICorporationCard {
  constructor() {
    super({
      name: CardName.FEASTFAIR,
      tags: [Tag.PLANT, Tag.MICROBE],
      startingMegaCredits: 40,
      behavior: {
        production: {plants: 1},
      },
      action: {},

      metadata: {
        cardNumber: 'EP-FEA',
        description: 'You start with 40 M€ and 1 plant production.',
        renderData: CardRenderer.builder((b) => {
          b.megacredits(40).production((pb) => pb.plants(1)).br;
          b.action('Trade up to 3 plants for 4 M€ each.', (eb) => {
            eb.text('X').plants(1).asterix().startAction.text('4X').megacredits(1);
          });
        }),
      },
    });
  }

  public override bespokeCanAct(player: IPlayer) {
    return player.plants > 0;
  }

  public override bespokeAction(player: IPlayer) {
    const max = Math.min(3, player.plants);
    return new SelectAmount('Select the number of plants to sell', 'Sell plants', 1, max, true).andThen((amount) => {
      player.stock.deduct(Resource.PLANTS, amount, {log: true});
      player.stock.add(Resource.MEGACREDITS, 4 * amount, {log: true});
      return undefined;
    });
  }
}
