import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {IActionCard} from '../ICard';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {SelectAmount} from '../../inputs/SelectAmount';
import {Resource} from '../../../common/Resource';

export class LunarMantleExcavation extends Card implements IProjectCard, IActionCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.LUNAR_MANTLE_EXCAVATION,
      tags: [Tag.POWER, Tag.MOON, Tag.BUILDING],
      cost: 15,
      requirements: {tag: Tag.MOON},
      victoryPoints: 1,

      behavior: {
        production: {energy: 1},
      },

      metadata: {
        cardNumber: 'B24',
        renderData: CardRenderer.builder((b) => {
          b.action('Spend any amount of energy to gain that amount of steel.', (eb) => {
            eb.text('x').energy(1).startAction.text('x').steel(1);
          }).br;
          b.production((pb) => pb.energy(1));
        }),
        description: 'Requires a Moon tag. Increase your energy production 1 step.',
      },
    });
  }

  public canAct(player: IPlayer) {
    return player.energy > 0;
  }

  public action(player: IPlayer) {
    return new SelectAmount('Select amount of energy to spend', 'Spend energy', 1, player.energy)
      .andThen((amount) => {
        player.stock.deduct(Resource.ENERGY, amount);
        player.stock.add(Resource.STEEL, amount, {log: true});
        return undefined;
      });
  }
}
