import {ActiveCorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';
import {IPlayer} from '../../IPlayer';
import {Resource} from '../../../common/Resource';
import {SelectAmount} from '../../inputs/SelectAmount';

export class Petriolium extends ActiveCorporationCard implements ICorporationCard {
  constructor() {
    super({
      name: CardName.PETRIOLIUM,
      tags: [Tag.MICROBE, Tag.POWER],
      startingMegaCredits: 34,
      behavior: {
        production: {plants: 2},
      },
      action: {},

      metadata: {
        cardNumber: 'EP-PET',
        description: 'You start with 34 M€ and 2 plant production.',
        renderData: CardRenderer.builder((b) => {
          b.br.br;
          b.megacredits(34).production((pb) => pb.plants(2));
          b.corpBox('action', (ce) => {
            ce.vSpace(Size.MEDIUM);
            ce.action('Spend any number of plants to gain twice that many energy.', (eb) => {
              eb.text('x').plants(1).startAction.text('2x').energy(1);
            });
          });
        }),
      },
    });
  }

  public override bespokeCanAct(player: IPlayer) {
    return player.plants > 0;
  }

  public override bespokeAction(player: IPlayer) {
    return new SelectAmount('Select the number of plants to spend', 'Spend plants', 1, player.plants, true).andThen((amount) => {
      player.stock.deduct(Resource.PLANTS, amount, {log: true});
      player.stock.add(Resource.ENERGY, 2 * amount, {log: true});
      return undefined;
    });
  }
}
