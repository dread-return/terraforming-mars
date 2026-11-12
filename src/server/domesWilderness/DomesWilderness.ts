import {IGame} from '../IGame';
import {LogHelper} from '../LogHelper';
import {IPlayer} from '../IPlayer';
import {Board} from '../boards/Board';
import {Space} from '../boards/Space';
import {AddResourcesToCard} from '../deferredActions/AddResourcesToCard';
import {GigaHooks} from '../turmoil/giga/GigaHooks';
import {PartyHooks} from '../turmoil/parties/PartyHooks';
import {BoardType} from '../boards/BoardType';
import {IdesOfMars} from '../cards/idesofmars/IdesOfMars';
import {OrOptions} from '../inputs/OrOptions';
import {SelectSpace} from '../inputs/SelectSpace';
import {PlayerInput} from '../PlayerInput';
import {UpgradeTile} from '../deferredActions/UpgradeTile';
import {Units} from '../../common/Units';
import {CardResource} from '../../common/CardResource';
import {Resource} from '../../common/Resource';
import {SpaceType} from '../../common/boards/SpaceType';
import {TileUpgrade} from '../../common/domesWilderness/DomesWilderness';
import {sum} from '../../common/utils/utils';

/**
 * Rules for Domes and Wilderness (Epic): a dome upgrades one of a player's cities on Mars, a wilderness
 * one of their greeneries. The upgrade is stored on the tile (`Tile.upgrade`), so the city or greenery
 * underneath keeps scoring as it always did.
 */
export class DomesWilderness {
  public static enabled(game: IGame): boolean {
    return game.gameOptions.domesWilderness === true;
  }

  /** How many cities `space` counts as for cards and effects: two with a dome. Scoring still counts one. */
  public static cityValue(space: Space): number {
    return space.tile?.upgrade === 'dome' ? 2 : 1;
  }

  /** How many greeneries `space` counts as for cards and effects: two with a wilderness. Scoring still counts one. */
  public static greeneryValue(space: Space): number {
    return space.tile?.upgrade === 'wilderness' ? 2 : 1;
  }

  /** Counts the city spaces in `spaces` with each dome counting twice. */
  public static countCities(spaces: ReadonlyArray<Space>): number {
    return sum(spaces.map((space) => this.cityValue(space)));
  }

  /** Counts the greenery spaces in `spaces` with each wilderness counting twice. */
  public static countGreeneries(spaces: ReadonlyArray<Space>): number {
    return sum(spaces.map((space) => this.greeneryValue(space)));
  }

  /** The cities of `player` on Mars that do not have a dome yet. */
  public static upgradeableCities(player: IPlayer): Array<Space> {
    return player.game.board.getCitiesOnMars(player)
      .filter((space) => space.tile?.upgrade === undefined && space.player === player);
  }

  /** The greeneries of `player` that do not have a wilderness yet. */
  public static upgradeableGreeneries(player: IPlayer): Array<Space> {
    return player.game.board.getGreeneries(player)
      .filter((space) => space.tile?.upgrade === undefined && space.player === player);
  }

  public static upgradeableSpaces(player: IPlayer, upgrade: TileUpgrade): Array<Space> {
    return upgrade === 'dome' ? this.upgradeableCities(player) : this.upgradeableGreeneries(player);
  }

  /**
   * The spaces where an effect that places a city (`kind` 'city') or a greenery ('greenery') could upgrade
   * instead. A placement restricted to a card's own list of spaces cannot upgrade, and neither can one
   * reserved for oceans or for isolated spaces unless the existing tile already satisfies it.
   */
  public static alternativeSpaces(player: IPlayer, kind: 'city' | 'greenery', restriction: {on?: string, spaces?: ReadonlyArray<Space>}): ReadonlyArray<Space> {
    if (!this.enabled(player.game) || restriction.spaces !== undefined) {
      return [];
    }
    const candidates = this.upgradeableSpaces(player, kind === 'city' ? 'dome' : 'wilderness');
    const board = player.game.board;
    switch (restriction.on) {
    case undefined:
    case 'city':
    case 'greenery':
      return candidates;
    case 'ocean':
      return candidates.filter((space) => space.spaceType === SpaceType.OCEAN);
    case 'isolated':
      return candidates.filter((space) => board.getAdjacentSpaces(space).every((adjacent) => adjacent.tile === undefined));
    default:
      return [];
    }
  }

  /**
   * Adds the "upgrade instead" choice to a placement of a city or greenery. `place` is the regular
   * placement input, or undefined when it has no space to go on. `done` is called with the space that
   * was used. Returns `place` untouched when no upgrade is possible, so the game plays as it normally does.
   */
  public static withAlternative(
    player: IPlayer,
    kind: 'city' | 'greenery',
    restriction: {on?: string, spaces?: ReadonlyArray<Space>},
    place: SelectSpace | undefined,
    done: (space: Space | undefined) => unknown): PlayerInput | undefined {
    const alternatives = this.alternativeSpaces(player, kind, restriction);
    if (alternatives.length === 0) {
      if (place === undefined) {
        done(undefined);
      }
      return place;
    }
    const upgrade: TileUpgrade = kind === 'city' ? 'dome' : 'wilderness';
    const instead = new SelectSpace(UpgradeTile.title(upgrade), alternatives)
      .andThen((space) => {
        this.upgrade(player, space, upgrade);
        done(space);
        return undefined;
      });
    return place === undefined ? instead : new OrOptions(place, instead);
  }

  /** The greeneries `player` can upgrade by converting plants, with their plants and TR tax in mind. */
  public static wildernessSpacesForPlants(player: IPlayer): ReadonlyArray<Space> {
    if (!this.enabled(player.game)) {
      return [];
    }
    const spaces = this.upgradeableGreeneries(player)
      .filter((space) => player.plants >= IdesOfMars.plantsForGreeneryOn(player, space));
    if (spaces.length === 0) {
      return [];
    }
    const cheapest = Math.min(...spaces.map((space) => IdesOfMars.plantsForGreeneryOn(player, space)));
    return player.canAfford({cost: 0, tr: {tr: 1}, reserveUnits: Units.of({plants: cheapest})}) ? spaces : [];
  }

  /** Whether a tile placed next to `space` is protected from hazard production loss by one of `player`'s domes. */
  public static protectedFromHazards(player: IPlayer, space: Space): boolean {
    if (!this.enabled(player.game)) {
      return false;
    }
    return player.game.board.getAdjacentSpaces(space)
      .some((adjacent) => adjacent.tile?.upgrade === 'dome' && Board.spaceOwnedBy(adjacent, player));
  }

  /**
   * Puts a dome on the city, or a wilderness on the greenery, at `space` and gives the standard project's
   * benefits. The upgrade counts as placing a city (dome) or a greenery (wilderness) for every card and
   * effect. No placement bonuses are collected, since nothing new is placed on the area.
   */
  public static upgrade(player: IPlayer, space: Space, upgrade: TileUpgrade): void {
    const game = player.game;
    const tile = space.tile;
    if (tile === undefined || !this.upgradeableSpaces(player, upgrade).includes(space)) {
      throw new Error(`Cannot place a ${upgrade} on space ${space.id}`);
    }

    tile.upgrade = upgrade;
    LogHelper.logBoardTileAction(player, space, upgrade);

    if (upgrade === 'dome') {
      player.production.add(Resource.MEGACREDITS, 1, {log: true});
      player.production.add(Resource.PLANTS, 1, {log: true});
      player.production.add(Resource.HEAT, 1, {log: true});
    } else {
      player.increaseTerraformRating();
      player.stock.add(Resource.PLANTS, 1, {log: true});
      game.defer(new AddResourcesToCard(player, CardResource.MICROBE, {count: 1}));
      game.defer(new AddResourcesToCard(player, CardResource.ANIMAL, {count: 1}));
      PartyHooks.applyGreensRulingPolicy(player, space);
    }

    game.triggerForAllCards((p, c) => c.onTilePlaced?.(p, player, space, BoardType.MARS));
    GigaHooks.onTilePlaced(player, space);
  }
}
