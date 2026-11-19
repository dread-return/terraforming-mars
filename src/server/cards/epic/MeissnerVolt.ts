import {ActiveCorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';
import {IPlayer} from '../../IPlayer';
import {Resource} from '../../../common/Resource';
import {SelectAmount} from '../../inputs/SelectAmount';

export class MeissnerVolt extends ActiveCorporationCard implements ICorporationCard {
  constructor() {
    super({
      name: CardName.MEISSNERVOLT,
      tags: [Tag.POWER],
      startingMegaCredits: 34,
      action: {},

      behavior: {
        production: {energy: 2},
      },

      metadata: {
        cardNumber: 'EP-MSV',
        description: 'You start with 34 M€ and 2 energy production.',
        renderData: CardRenderer.builder((b) => {
          b.br;
          b.megacredits(34).production((pb) => pb.energy(2));
          b.corpBox('effect-action', (ce) => {
            ce.vSpace(Size.SMALL);
            ce.effect('Your energy does not become heat in the production phase.', (eb) => {
              eb.energy(1).startEffect.heat(1, {cancelled: true});
            });
            ce.vSpace(Size.SMALL);
            ce.action('Spend X energy to gain twice as much M€.', (eb) => {
              eb.energy(1).text('x').startAction.megacredits(2, {text: '2x'});
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
    return new SelectAmount('Spend how much energy?', 'Spend', 1, player.energy, true).andThen((x) => {
      player.stock.deduct(Resource.ENERGY, x, {log: true});
      player.stock.add(Resource.MEGACREDITS, 2 * x, {log: true});
      return undefined;
    });
  }
}
