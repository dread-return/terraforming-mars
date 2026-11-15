import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {Resource} from '../../../common/Resource';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {HighOrbit} from '../../highOrbit/HighOrbit';
import {InfrastructureActionCard} from './InfrastructureCard';

/** Epic version: energy tag; the action also gives 1 energy per Powersat you own. */
export class Powersat extends InfrastructureActionCard {
  constructor(copy: number = 1) {
    super(CardName.POWERSAT, copy, {
      tags: [Tag.POWER],
      action: {
        spend: {titanium: 2},
        production: {energy: 1},
      },
      metadata: {
        cardNumber: 'HO46',
        renderData: CardRenderer.builder((b) => {
          b.action('Spend 2 titanium to increase your energy production 1 step and gain 1 energy for each Powersat you own.', (eb) => {
            eb.titanium(2).startAction.production((pb) => pb.energy(1)).energy(1).text('x');
          });
        }),
      },
    });
  }

  public override bespokeAction(player: IPlayer) {
    const count = HighOrbit.countOwned(player, CardName.POWERSAT);
    player.stock.add(Resource.ENERGY, count, {log: true, from: {card: this}});
    return undefined;
  }
}
