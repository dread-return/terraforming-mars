import {IGame} from '../IGame';
import {IPlayer} from '../IPlayer';
import {Space} from '../boards/Space';
import {SpaceBonus} from '../../common/boards/SpaceBonus';
import {SpaceType} from '../../common/boards/SpaceType';
import {Resource} from '../../common/Resource';
import {Tag} from '../../common/cards/Tag';
import {INDUSTRY_TILES, TileType} from '../../common/TileType';
import {
  INDUSTRY_RESOURCES, INDUSTRY_TILE, INDUSTRY_TRACK_CARD_STEP, INDUSTRY_TRACK_PRELUDE_STEP, IndustryKind, MAX_INDUSTRIES,
} from '../../common/industries/Industries';
import {DeferredAction} from '../deferredActions/DeferredAction';
import {Priority} from '../deferredActions/Priority';
import {PlayerInput} from '../PlayerInput';
import {SelectSpace} from '../inputs/SelectSpace';
import {SelectAmount} from '../inputs/SelectAmount';
import {SelectResource} from '../inputs/SelectResource';
import {PreludesExpansion} from '../preludes/PreludesExpansion';

const PRODUCTION: Record<Exclude<IndustryKind, 'random'>, Resource> = {
  money: Resource.MEGACREDITS,
  heat: Resource.HEAT,
  energy: Resource.ENERGY,
  steel: Resource.STEEL,
  plant: Resource.PLANTS,
  titanium: Resource.TITANIUM,
};

/** The space bonus that stands for a resource distributed by each industry. */
const BONUS: Record<IndustryKind, SpaceBonus> = {
  money: SpaceBonus.MEGACREDITS,
  heat: SpaceBonus.HEAT,
  energy: SpaceBonus.ENERGY,
  steel: SpaceBonus.STEEL,
  plant: SpaceBonus.PLANT,
  titanium: SpaceBonus.TITANIUM,
  random: SpaceBonus.STANDARD_RESOURCE,
};

/**
 * The GIGA Industries add-on: industry tiles that are bought as standard projects.
 *
 * Industry tiles are plain tiles, not special tiles, and have no adjacency bonus. A player needs more
 * power tags than the industries they own, and the industry track does not give TR.
 */
export class Industries {
  private constructor() {}

  public static isActive(game: IGame): boolean {
    return game.gameOptions.industriesExpansion === true;
  }

  /** The kind of industry for an industry tile, or `undefined` for any other tile. */
  public static kindOf(tileType: TileType): IndustryKind | undefined {
    for (const [kind, type] of Object.entries(INDUSTRY_TILE)) {
      if (type === tileType) {
        return kind as IndustryKind;
      }
    }
    return undefined;
  }

  /** The industries `player` owns, which is also their position on the industry track. */
  public static owned(player: IPlayer): number {
    return player.game.board.spaces.filter((space) =>
      space.tile !== undefined && INDUSTRY_TILES.has(space.tile.tileType) && space.player?.id === player.id).length;
  }

  /** The most industries a player may own: 13 on the GIGA board, 5 everywhere else. */
  public static max(_game: IGame): number {
    // TODO(Leo): return GIGA_BOARD_MAX_INDUSTRIES (13) on the GIGA board, once it exists.
    return MAX_INDUSTRIES;
  }

  /** Requirement to buy an industry: more power tags than industries owned, and room on the track. */
  public static canBuild(player: IPlayer): boolean {
    const owned = Industries.owned(player);
    return owned < Industries.max(player.game) && player.tags.count(Tag.POWER) > owned;
  }

  /** Raises the production an industry gives, then distributes its resources and checks the track. */
  public static onPlaced(player: IPlayer, kind: IndustryKind, space: Space): void {
    if (kind === 'random') {
      player.defer(new SelectResource('Select a production to increase by 1')
        .andThen((resource) => {
          player.production.add(resource, 1, {log: true});
          return undefined;
        }));
    } else {
      player.production.add(PRODUCTION[kind], 1, {log: true});
    }
    player.game.defer(new DistributeIndustryResources(player, kind, space));
    Industries.grantTrackBonus(player);
  }

  /** Grants the bonus printed on the industry track at the step `player` has just reached. */
  public static grantTrackBonus(player: IPlayer): void {
    const owned = Industries.owned(player);
    const game = player.game;
    if (owned === INDUSTRY_TRACK_CARD_STEP) {
      game.log('${0} reached step ${1} of the industry track', (b) => b.player(player).number(owned));
      player.drawCard(1);
    } else if (owned === INDUSTRY_TRACK_PRELUDE_STEP) {
      game.log('${0} reached step ${1} of the industry track', (b) => b.player(player).number(owned));
      const preludes = game.preludeDeck.drawN(game, 1);
      if (preludes.length > 0) {
        player.defer(PreludesExpansion.selectPreludeToPlay(player, preludes, 'discard'));
      }
    }
  }

  /**
   * The areas next to an industry that can receive its resources: empty areas, and areas whose tile
   * has an owner who collects them. Areas whose tile has no owner (an ocean, say) can't use them.
   */
  public static distributionSpaces(game: IGame, origin: Space): ReadonlyArray<Space> {
    return game.board.getAdjacentSpaces(origin).filter((space) => {
      if (space.cube !== undefined || space.spaceType === SpaceType.RESTRICTED) {
        return false;
      }
      return space.tile === undefined || space.player !== undefined;
    });
  }

  /**
   * Puts `count` resources of an industry on `space`. An owner of a tile there collects them at once;
   * otherwise they wait on the empty area for whoever places a tile on it next.
   */
  public static distribute(player: IPlayer, space: Space, kind: IndustryKind, count: number): void {
    const game = player.game;
    const bonus = BONUS[kind];
    if (space.tile !== undefined) {
      const owner = space.player;
      if (owner !== undefined) {
        game.grantSpaceBonus(owner, bonus, count);
      }
      return;
    }
    for (let i = 0; i < count; i++) {
      space.bonus.push(bonus);
    }
    game.log('${0} placed ${1} ${2} on space ${3}', (b) => b.player(player).number(count).spaceBonus(bonus).space(space));
  }
}

/**
 * Has a player split an industry's resources over two areas next to its tile. The random industry
 * puts its single resource on one area.
 */
export class DistributeIndustryResources extends DeferredAction {
  constructor(
    player: IPlayer,
    private readonly kind: IndustryKind,
    private readonly origin: Space,
  ) {
    super(player, Priority.DEFAULT);
  }

  public execute(): PlayerInput | undefined {
    const total = INDUSTRY_RESOURCES[this.kind];
    const spaces = Industries.distributionSpaces(this.player.game, this.origin);
    if (spaces.length === 0) {
      return undefined;
    }
    if (total === 1 || spaces.length === 1) {
      if (spaces.length === 1) {
        Industries.distribute(this.player, spaces[0], this.kind, total);
        return undefined;
      }
      return new SelectSpace('Select an area next to the industry for its resource', spaces)
        .andThen((space) => {
          Industries.distribute(this.player, space, this.kind, total);
          return undefined;
        });
    }

    return new SelectSpace('Select the first area next to the industry for its resources', spaces)
      .andThen((first) => {
        const others = spaces.filter((space) => space.id !== first.id);
        const placeRest = (firstCount: number): PlayerInput => {
          return new SelectSpace(
            'Select the second area next to the industry for its remaining resources',
            others)
            .andThen((second) => {
              Industries.distribute(this.player, first, this.kind, firstCount);
              Industries.distribute(this.player, second, this.kind, total - firstCount);
              return undefined;
            });
        };
        if (total === 2) {
          return placeRest(1);
        }
        return new SelectAmount(
          'How many resources go on the first area? The rest go on the second area.',
          'Select',
          1,
          total - 1)
          .andThen((amount) => placeRest(amount));
      });
  }
}
