import {ActiveCorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';
import {IPlayer} from '../../IPlayer';
import {Resource} from '../../../common/Resource';
import {OrOptions} from '../../inputs/OrOptions';
import {SelectOption} from '../../inputs/SelectOption';
import {SelectAmount} from '../../inputs/SelectAmount';

export class MegaThermoElectric extends ActiveCorporationCard implements ICorporationCard {
  constructor() {
    super({
      name: CardName.MEGA_THERMOELECTRIC,
      tags: [Tag.POWER],
      startingMegaCredits: 34,
      action: {},

      behavior: {
        production: {energy: 1, heat: 1},
      },

      metadata: {
        cardNumber: 'EP-MTE',
        description: 'You start with 34 M€, 1 energy production and 1 heat production.',
        renderData: CardRenderer.builder((b) => {
          b.br;
          b.megacredits(34).production((pb) => pb.energy(1).heat(1));
          b.corpBox('effect-action', (ce) => {
            ce.vSpace(Size.SMALL);
            ce.effect('Your energy does not become heat in the production phase.', (eb) => {
              eb.energy(1).startEffect.heat(1, {cancelled: true});
            });
            ce.vSpace(Size.SMALL);
            ce.action('Turn X energy into X heat, OR up to 2 heat into energy.', (eb) => {
              eb.energy(1).text('x').startAction.heat(1).text('x').asterix();
            });
          });
        }),
      },
    });
  }

  public override bespokeCanAct(player: IPlayer) {
    return player.energy > 0 || player.heat > 0;
  }

  public override bespokeAction(player: IPlayer) {
    const options: Array<SelectOption> = [];
    if (player.energy > 0) {
      options.push(new SelectOption('Turn energy into heat', 'Convert').andThen(() =>
        new SelectAmount('How much energy?', 'Convert', 1, player.energy, true).andThen((x) => {
          player.stock.deduct(Resource.ENERGY, x, {log: true});
          player.stock.add(Resource.HEAT, x, {log: true});
          return undefined;
        })));
    }
    if (player.heat > 0) {
      options.push(new SelectOption('Turn up to 2 heat into energy', 'Convert').andThen(() =>
        new SelectAmount('How much heat?', 'Convert', 1, Math.min(2, player.heat), true).andThen((x) => {
          player.stock.deduct(Resource.HEAT, x, {log: true});
          player.stock.add(Resource.ENERGY, x, {log: true});
          return undefined;
        })));
    }
    return options.length === 1 ? options[0].cb(undefined) : new OrOptions(...options);
  }
}
