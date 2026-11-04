import {IPlayer} from '../../IPlayer';
import {Space} from '../../boards/Space';
import {Board} from '../../boards/Board';
import {SpaceType} from '../../../common/boards/SpaceType';
import {SpaceBonus} from '../../../common/boards/SpaceBonus';
import {HAZARD_TILES, TileType} from '../../../common/TileType';
import {CardName} from '../../../common/cards/CardName';
import {SelectSpace} from '../../inputs/SelectSpace';

/**
 * Helpers for the Rob Antilles special tiles.
 */
export class RobAntillesTiles {
  /** Spaces on Mars (not in space) owned by `player` holding exactly `tileType`. */
  public static ownTiles(player: IPlayer, tileType: TileType): ReadonlyArray<Space> {
    return player.game.board.spaces.filter((space) =>
      space.spaceType !== SpaceType.COLONY &&
      space.tile?.tileType === tileType &&
      Board.ownedBy(player)(space));
  }

  /** The space holding the tile placed by `card`, if any. */
  public static spaceFor(player: IPlayer, card: CardName): Space | undefined {
    return player.game.board.spaces.find((space) => space.tile?.card === card);
  }

  /** A special tile is any tile other than a plain greenery, ocean or city (and not a hazard). */
  public static isSpecialTile(space: Space): boolean {
    const tileType = space.tile?.tileType;
    if (tileType === undefined) {
      return false;
    }
    if (tileType === TileType.GREENERY || tileType === TileType.OCEAN || tileType === TileType.CITY) {
      return false;
    }
    return !HAZARD_TILES.has(tileType);
  }

  /**
   * Returns a SelectSpace that places `tileType` (for `card`) on one of `spaces`,
   * adding the given adjacency bonus.
   */
  public static place(
    player: IPlayer,
    card: CardName,
    tileType: TileType,
    spaces: ReadonlyArray<Space>,
    bonus: Array<SpaceBonus>,
    title: string,
    cb: (space: Space) => void = () => {},
  ): SelectSpace | undefined {
    if (spaces.length === 0) {
      return undefined;
    }
    return new SelectSpace(title, spaces).andThen((space) => {
      const covers = space.tile;
      player.game.addTile(player, space, {tileType, card, covers});
      space.adjacency = {bonus};
      cb(space);
      return undefined;
    });
  }
}
