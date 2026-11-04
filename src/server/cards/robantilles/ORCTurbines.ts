import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {SelectAmount} from '../../inputs/SelectAmount';

export class ORCTurbines extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.ORC_TURBINES,
      tags: [Tag.POWER],
      cost: 4,

      metadata: {
        cardNumber: 'H05',
        renderData: CardRenderer.builder((b) => {
          b.action('Spend 2 heat to gain 1 energy, up to 5 times.', (eb) => {
            eb.heat(2).startAction.energy(1).text('max 5');
          }).br;
          b.effect('When you must decrease your energy production and cannot, decrease your heat production 2 steps per missing step instead.', (eb) => {
            eb.production((pb) => pb.minus().energy(1)).startEffect.production((pb) => pb.minus().heat(2));
          });
        }),
      },
    });
  }

  public canAct(player: IPlayer) {
    return player.heat >= 2;
  }

  public action(player: IPlayer) {
    const max = Math.min(5, Math.floor(player.heat / 2));
    return new SelectAmount('Select how many energy to gain (2 heat each)', 'Convert', 1, max, true)
      .andThen((amount) => {
        player.heat -= 2 * amount;
        player.energy += amount;
        player.game.log('${0} spent ${1} heat to gain ${2} energy', (b) => b.player(player).number(2 * amount).number(amount));
        return undefined;
      });
  }
}
