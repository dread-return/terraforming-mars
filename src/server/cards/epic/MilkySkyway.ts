import {CorporationCard} from '../corporation/CorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';
import {IPlayer} from '../../IPlayer';
import {Space} from '../../boards/Space';
import {Board} from '../../boards/Board';
import {SpaceType} from '../../../common/boards/SpaceType';
import * as VP from '../render/DynamicVictoryPoints';

export class MilkySkyway extends CorporationCard {
  constructor() {
    super({
      name: CardName.MILKY_SKYWAY,
      tags: [Tag.BUILDING, Tag.POWER],
      startingMegaCredits: 50,
      victoryPoints: 'special',

      behavior: {
        production: {energy: 2},
      },

      metadata: {
        cardNumber: 'EP-MSK',
        description: 'You start with 50 M€ and 2 energy production. 1 VP per city you have in your largest group of connected tiles on Mars.',
        renderData: CardRenderer.builder((b) => {
          b.production((pb) => pb.energy(2)).megacredits(50);
          b.corpBox('effect', (ce) => {
            ce.vSpace(Size.MEDIUM);
            ce.effect('You may spend energy as 2 M€ each for cards with a city tag and the city standard project.', (eb) => {
              eb.energy(1).equals().megacredits(2).startEffect.tag(Tag.CITY).slash().city({size: Size.SMALL});
            });
          });
        }),
        victoryPoints: VP.cities(1, 1, false, true),
      },
    });
  }

  public override getVictoryPoints(player: IPlayer): number {
    return MilkySkyway.citiesInLargestGroup(player);
  }

  /** Your cities in your largest group of connected tiles on Mars (your own tiles, oceans not included). */
  public static citiesInLargestGroup(player: IPlayer): number {
    const board = player.game.board;
    const mine = (space: Space) => space.player?.id === player.id && Board.hasRealTile(space) && space.spaceType !== SpaceType.COLONY;
    const seen = new Set<string>();
    let best = {size: 0, cities: 0};
    for (const start of board.spaces) {
      if (!mine(start) || seen.has(start.id)) {
        continue;
      }
      const group = {size: 0, cities: 0};
      const stack = [start];
      seen.add(start.id);
      for (let space = stack.pop(); space !== undefined; space = stack.pop()) {
        group.size++;
        if (Board.isCitySpace(space)) {
          group.cities++;
        }
        for (const adj of board.getAdjacentSpaces(space)) {
          if (mine(adj) && !seen.has(adj.id)) {
            seen.add(adj.id);
            stack.push(adj);
          }
        }
      }
      if (group.size > best.size || (group.size === best.size && group.cities > best.cities)) {
        best = group;
      }
    }
    return best.cities;
  }
}
