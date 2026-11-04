import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {Board} from '../../boards/Board';
import {Space} from '../../boards/Space';
import {Resource} from '../../../common/Resource';

export class MartianCommercialSeafleet extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.MARTIAN_COMMERCIAL_SEAFLEET,
      tags: [Tag.BUILDING],
      cost: 18,
      requirements: {oceans: 3},

      metadata: {
        cardNumber: 'H53',
        renderData: CardRenderer.builder((b) => {
          b.action('Spend 1 steel to gain 2 M€ for each of your cities connected to another city through oceans.', (eb) => {
            eb.steel(1).startAction.megacredits(2).slash().city().asterix();
          });
        }),
        description: 'Requires 3 ocean tiles.',
      },
    });
  }

  /**
   * Counts `player`'s cities that touch a group of connected oceans that also touches another city.
   */
  public static connectedCities(player: IPlayer): number {
    const board = player.game.board;
    // Label each ocean with a group id.
    const group = new Map<Space, number>();
    let next = 0;
    for (const ocean of board.spaces.filter(Board.isOceanSpace)) {
      if (group.has(ocean)) {
        continue;
      }
      const id = next++;
      const stack = [ocean];
      group.set(ocean, id);
      for (let s = stack.pop(); s !== undefined; s = stack.pop()) {
        for (const adj of board.getAdjacentSpaces(s)) {
          if (Board.isOceanSpace(adj) && !group.has(adj)) {
            group.set(adj, id);
            stack.push(adj);
          }
        }
      }
    }
    const groupsOf = (city: Space) => {
      const ids = new Set<number>();
      for (const adj of board.getAdjacentSpaces(city)) {
        const id = group.get(adj);
        if (id !== undefined) {
          ids.add(id);
        }
      }
      return ids;
    };
    const cities = board.getCitiesOnMars();
    let count = 0;
    for (const city of board.getCitiesOnMars(player)) {
      const mine = groupsOf(city);
      const connected = cities.some((other) => other !== city && [...groupsOf(other)].some((g) => mine.has(g)));
      if (connected) {
        count++;
      }
    }
    return count;
  }

  public canAct(player: IPlayer) {
    return player.steel >= 1;
  }

  public action(player: IPlayer) {
    player.stock.deduct(Resource.STEEL, 1);
    const count = MartianCommercialSeafleet.connectedCities(player);
    player.stock.add(Resource.MEGACREDITS, 2 * count, {log: true});
    return undefined;
  }
}
