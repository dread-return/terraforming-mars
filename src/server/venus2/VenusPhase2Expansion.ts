import {IGame} from '../IGame';
import {IPlayer} from '../IPlayer';
import {Tile} from '../Tile';
import {Space} from '../boards/Space';
import {Board} from '../boards/Board';
import {BoardType} from '../boards/BoardType';
import {Phase} from '../../common/Phase';
import {TileType, VENUS_TILES} from '../../common/TileType';
import {CardName} from '../../common/cards/CardName';
import {CardResource} from '../../common/CardResource';
import {SpaceId} from '../../common/Types';
import {SpaceType} from '../../common/boards/SpaceType';
import {VictoryPointsBreakdownBuilder} from '../game/VictoryPointsBreakdownBuilder';
import {LogHelper} from '../LogHelper';
import {VenusBoard} from './VenusBoard';
import {VenusMapData} from './VenusMapData';
import {sum} from '../../common/utils/utils';

/** Tile types that can be placed on the Venus map, plus cities placed there by cards. */
export type VenusTileType = TileType.VENUS_FLOATING_ARRAY | TileType.VENUS_GAS_MINE | TileType.VENUS_HABITAT;

/** Each floater spent on a Venus standard project is worth this much. */
export const VENUS_FLOATER_VALUE = 3;

export class VenusPhase2Expansion {
  private constructor() {}

  public static initialize(): VenusMapData {
    return {board: VenusBoard.newInstance()};
  }

  public static isActive(game: IGame): boolean {
    return game.gameOptions.venusPhase2Expansion === true && game.venusMapData !== undefined;
  }

  /** Returns the Venus map, or throws when Venus Phase 2 is not in the game. */
  public static board(game: IGame): VenusBoard {
    if (game.venusMapData === undefined) {
      throw new Error('Assertion error: using the Venus map when Venus Phase 2 is not in the game.');
    }
    return game.venusMapData.board;
  }

  public static availableSpaces(player: IPlayer, tileType: VenusTileType | TileType.CITY): ReadonlyArray<Space> {
    const board = this.board(player.game);
    return tileType === TileType.VENUS_GAS_MINE ?
      board.getAvailableSpacesForGasMine(player) :
      board.getAvailableSpacesOnLand(player);
  }

  /**
   * Places a tile on the Venus map. Venus tiles (Floating Array, Gas Mine, Venus Habitat) raise Venus 1 step.
   */
  public static addTile(player: IPlayer, spaceId: SpaceId, tile: Tile): void {
    const game = player.game;
    const board = this.board(game);
    const space = board.getSpaceOrThrow(spaceId);
    if (!VENUS_TILES.has(tile.tileType) && tile.tileType !== TileType.CITY) {
      throw new Error(`Bad tile type for Venus: ${tile.tileType}`);
    }
    if (space.tile !== undefined) {
      throw new Error('Selected space is occupied');
    }
    if (tile.tileType === TileType.VENUS_GAS_MINE && space.spaceType !== SpaceType.VENUS_GAS_MINE) {
      throw new Error('Gas Mines go on the yellow areas only');
    }
    if (tile.tileType !== TileType.VENUS_GAS_MINE && space.spaceType === SpaceType.VENUS_GAS_MINE) {
      throw new Error('Only Gas Mines go on the yellow areas');
    }
    if (space.player !== undefined && space.player.id !== player.id) {
      throw new Error('This space is claimed by ' + space.player.name);
    }

    space.tile = tile;
    if (game.phase !== Phase.SOLAR) {
      space.player = player;
      game.grantSpaceBonusesAsPlacement(player, space);
    }
    LogHelper.logTilePlacement(player, space, tile.tileType);

    game.triggerForAllCards((p, c) => c.onTilePlaced?.(p, player, space, BoardType.VENUS));

    if (VENUS_TILES.has(tile.tileType)) {
      game.increaseVenusScaleLevel(player, 1);
    }
  }

  /** Places a city on the Venus map (Stratopolis, Maxwell Base, Cloud City, Tropospheric City). */
  public static addCity(player: IPlayer, spaceId: SpaceId, card?: CardName): void {
    this.addTile(player, spaceId, {tileType: TileType.CITY, card});
  }

  /** Spaces on the Venus map holding a tile, optionally of one type and owned by one player. */
  public static spaces(game: IGame, tileType?: TileType, ownedBy?: IPlayer): ReadonlyArray<Space> {
    if (game.venusMapData === undefined) {
      return [];
    }
    return game.venusMapData.board.spaces.filter((space) => {
      if (space.tile === undefined) {
        return false;
      }
      if (tileType !== undefined && space.tile.tileType !== tileType) {
        return false;
      }
      return ownedBy === undefined || Board.spaceOwnedBy(space, ownedBy);
    });
  }

  /** Cities on the Venus map. They count as cities in space (off Mars). */
  public static cities(game: IGame): ReadonlyArray<Space> {
    return this.spaces(game, TileType.CITY);
  }

  /** Number of tiles of `tileType` `player` has on Venus. */
  public static count(player: IPlayer, tileType: TileType): number {
    return this.spaces(player.game, tileType, player).length;
  }

  /** True when anyone has placed a Venus Habitat. */
  public static anyHabitat(game: IGame): boolean {
    return this.spaces(game, TileType.VENUS_HABITAT).length > 0;
  }

  /**
   * Venus Habitats, Gas Mines and cities on Venus are worth 1 VP per adjacent Floating Array (anyone's).
   */
  public static calculateVictoryPoints(player: IPlayer, builder: VictoryPointsBreakdownBuilder): void {
    const game = player.game;
    if (game.venusMapData === undefined) {
      return;
    }
    const board = game.venusMapData.board;
    for (const space of board.spaces) {
      const tileType = space.tile?.tileType;
      if (tileType !== TileType.VENUS_HABITAT && tileType !== TileType.VENUS_GAS_MINE && tileType !== TileType.CITY) {
        continue;
      }
      if (!Board.spaceOwnedBy(space, player)) {
        continue;
      }
      const arrays = board.getAdjacentSpaces(space).filter((adj) => adj.tile?.tileType === TileType.VENUS_FLOATING_ARRAY).length;
      builder.setVictoryPoints('venus tiles', arrays);
    }
  }

  /** Total floaters on all of `player`'s cards. These can pay for Venus standard projects. */
  public static floatersOnCards(player: IPlayer): number {
    return sum(player.getCardsWithResources(CardResource.FLOATER).map((card) => card.resourceCount));
  }

  /** Value of one floater spent on a Venus standard project. */
  public static floaterValue(player: IPlayer): number {
    return VENUS_FLOATER_VALUE + (player.tableau.has(CardName.NEGATIVE_MASS_FLUIDS) ? 1 : 0);
  }
}
