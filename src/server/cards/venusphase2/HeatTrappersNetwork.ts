import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {IActionCard} from '../ICard';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {TileType} from '../../../common/TileType';
import {Resource} from '../../../common/Resource';
import {VenusPhase2Expansion} from '../../venus2/VenusPhase2Expansion';

export class HeatTrappersNetwork extends Card implements IProjectCard, IActionCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.HEAT_TRAPPERS_NETWORK,
      tags: [Tag.VENUS],
      cost: 3,

      behavior: {
        production: {energy: -1},
      },

      metadata: {
        cardNumber: 'V61',
        renderData: CardRenderer.builder((b) => {
          b.action('Spend 2 heat to gain 1 M€ for each Gas Mine you own on Venus.', (eb) => {
            eb.heat(2).startAction.megacredits(1).slash().tile(TileType.VENUS_GAS_MINE);
          }).br;
          b.production((pb) => pb.minus().energy(1));
        }),
        description: 'Decrease your energy production 1 step.',
      },
    });
  }

  public canAct(player: IPlayer) {
    return player.availableHeat() >= 2 && VenusPhase2Expansion.count(player, TileType.VENUS_GAS_MINE) > 0;
  }

  public action(player: IPlayer) {
    return player.spendHeat(2, () => {
      const count = VenusPhase2Expansion.count(player, TileType.VENUS_GAS_MINE);
      player.stock.add(Resource.MEGACREDITS, count, {log: true, from: {card: this}});
      return undefined;
    });
  }
}
