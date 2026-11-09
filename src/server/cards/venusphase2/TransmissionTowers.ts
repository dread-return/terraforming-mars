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

export class TransmissionTowers extends Card implements IProjectCard, IActionCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.TRANSMISSION_TOWERS,
      tags: [Tag.VENUS, Tag.BUILDING],
      cost: 12,
      victoryPoints: 1,
      requirements: {venus: 8},

      behavior: {
        production: {megacredits: -1},
      },

      metadata: {
        cardNumber: 'V60',
        renderData: CardRenderer.builder((b) => {
          b.action('Gain 1 energy per Floating Array you own on Venus.', (eb) => {
            eb.empty().startAction.energy(1).slash().tile(TileType.VENUS_FLOATING_ARRAY);
          }).br;
          b.production((pb) => pb.minus().megacredits(1));
        }),
        description: 'Decrease your M€ production 1 step.',
      },
    });
  }

  public canAct(player: IPlayer) {
    return VenusPhase2Expansion.count(player, TileType.VENUS_FLOATING_ARRAY) > 0;
  }

  public action(player: IPlayer) {
    const count = VenusPhase2Expansion.count(player, TileType.VENUS_FLOATING_ARRAY);
    player.stock.add(Resource.ENERGY, count, {log: true, from: {card: this}});
    return undefined;
  }
}
