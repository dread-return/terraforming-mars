import {IPlayer} from '../../IPlayer';
import {Space} from '../../boards/Space';
import {SpaceType} from '../../../common/boards/SpaceType';
import {Board} from '../../boards/Board';

/**
 * Helpers shared by Corporate Betterments cards.
 */
export class BettermentsUtils {
  /** True when `player` owns (or co-owns) the tile on `space`. */
  public static owns(player: IPlayer, space: Space): boolean {
    return space.tile !== undefined && (space.player === player || space.coOwner === player);
  }

  /** The tiles `player` owns on Mars (not in space). */
  public static tilesOnMars(player: IPlayer): ReadonlyArray<Space> {
    return player.game.board.spaces.filter((space) =>
      space.spaceType !== SpaceType.COLONY && this.owns(player, space));
  }

  /** The cities `player` owns on Mars. */
  public static citiesOnMars(player: IPlayer): ReadonlyArray<Space> {
    return this.tilesOnMars(player).filter(Board.isCitySpace);
  }

  public static adjacentOceans(player: IPlayer, space: Space): number {
    return player.game.board.getAdjacentSpaces(space).filter(Board.isOceanSpace).length;
  }

  public static adjacentGreeneries(player: IPlayer, space: Space): number {
    return player.game.board.getAdjacentSpaces(space).filter(Board.isGreenerySpace).length;
  }
}
