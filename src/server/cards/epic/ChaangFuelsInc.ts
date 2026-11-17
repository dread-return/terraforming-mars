import {ActiveCorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';
import {IPlayer} from '../../IPlayer';
import {Resource} from '../../../common/Resource';
import {all} from '../Options';
import {SelectAmount} from '../../inputs/SelectAmount';

export class ChaangFuelsInc extends ActiveCorporationCard implements ICorporationCard {
  constructor() {
    super({
      name: CardName.CHAANG_FUELS_INC,
      tags: [Tag.SPACE, Tag.POWER],
      startingMegaCredits: 32,
      action: {},

      behavior: {
        production: {energy: 1},
        colonies: {tradeDiscount: 1},
      },

      metadata: {
        cardNumber: 'EP-CHF',
        description: 'You start with 32 M€ and 1 energy production. Your trades cost 1 less.',
        renderData: CardRenderer.builder((b) => {
          b.br;
          b.megacredits(32).production((pb) => pb.energy(1)).tradeDiscount(1);
          b.corpBox('effect-action', (ce) => {
            ce.vSpace(Size.SMALL);
            ce.effect('When an opponent trades, take half (rounded down) of what they paid.', (eb) => {
              eb.trade({all}).startEffect.text('½ paid', {size: Size.SMALL});
            });
            ce.vSpace(Size.SMALL);
            ce.action('Spend 3X heat to gain 2X energy.', (eb) => {
              eb.heat(3).text('x').startAction.energy(2).text('x');
            });
          });
        }),
      },
    });
  }

  public override bespokeCanAct(player: IPlayer) {
    return player.heat >= 3;
  }

  public override bespokeAction(player: IPlayer) {
    const max = Math.floor(player.heat / 3);
    return new SelectAmount('Spend 3X heat to gain 2X energy', 'Convert', 1, max, true).andThen((x) => {
      player.stock.deduct(Resource.HEAT, 3 * x, {log: true});
      player.stock.add(Resource.ENERGY, 2 * x, {log: true});
      return undefined;
    });
  }
}
