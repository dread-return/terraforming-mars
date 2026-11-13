import {CardName} from '../../common/cards/CardName';
import {CardResource} from '../../common/CardResource';
import {Resource} from '../../common/Resource';
import {TileType} from '../../common/TileType';
import {Random} from '../../common/utils/Random';
import {
  POSTLUDE_GENERATION,
  POSTLUDE_SOURCES,
  PostludeKind,
  PostludeReason,
  PostludeSource,
  TR_POSTLUDE_THRESHOLDS,
} from '../../common/postludes/Postludes';
import {Board} from '../boards/Board';
import {Space} from '../boards/Space';
import {Deck, PostludeDeck} from '../cards/Deck';
import {IProjectCard} from '../cards/IProjectCard';
import {IPostludeCard, isPostludeCard} from '../cards/postludes/IPostludeCard';
import {SerializedDeck} from '../cards/SerializedDeck';
import {SimpleDeferredAction} from '../deferredActions/DeferredAction';
import {AddResourcesToCard} from '../deferredActions/AddResourcesToCard';
import {ChoosePostlude} from '../deferredActions/ChoosePostlude';
import {SelectResource} from '../inputs/SelectResource';
import {IGame} from '../IGame';
import {IPlayer} from '../IPlayer';
import {MoonExpansion} from '../moon/MoonExpansion';
import {message} from '../logs/MessageBuilder';
import {VictoryPointsBreakdownBuilder} from '../game/VictoryPointsBreakdownBuilder';
import {IStandardProjectCard} from '../cards/IStandardProjectCard';
import {INDUSTRY_STANDARD_PROJECTS} from '../../common/industries/Industries';
import {StandardProjectCanPayWith} from '../../common/cards/Types';
import {Payment} from '../../common/inputs/Payment';
import {POSTLUDE_ADJACENCY} from './PostludeAdjacency';

/** Postludes: the postlude deck, and the silver cubes left on each of the seven spaces where one can be gained. */
export type PostludesState = {
  deck: PostludeDeck;
  cubes: Record<PostludeSource, number>;
  /** The players that already took the postlude for reaching 25 or 35 TR. */
  claimed: Record<'tr25' | 'tr35', Array<string>>;
};

export type SerializedPostludes = {
  deck: SerializedDeck;
  cubes: Record<PostludeSource, number>;
  claimed: Record<'tr25' | 'tr35', Array<string>>;
};

/**
 * Rules for Postludes (Epic rulebook, p. 31).
 *
 * A postlude is a project card kept in hand and played on top of a city, greenery or ocean. The postlude is
 * stored on the tile (`Tile.postlude`), so the tile underneath keeps counting as it always did.
 */
export class Postludes {
  public static enabled(game: IGame): boolean {
    return game.postludes !== undefined;
  }

  // ---- Setup and saving -------------------------------------------------------------------------------------

  /**
   * One silver cube on every space for each two players. With an odd number of players, half of the spaces
   * (four of the seven, chosen at random) get one more.
   */
  public static newState(cards: Array<IProjectCard>, playerCount: number, rng: Random): PostludesState {
    const deck = new PostludeDeck(cards, [], rng);
    deck.shuffle();
    const base = Math.floor(playerCount / 2);
    const cubes = {} as Record<PostludeSource, number>;
    for (const source of POSTLUDE_SOURCES) {
      cubes[source] = base;
    }
    if (playerCount % 2 === 1) {
      const shuffled = [...POSTLUDE_SOURCES];
      Deck.shuffle(shuffled, rng);
      for (const source of shuffled.slice(0, Math.ceil(POSTLUDE_SOURCES.length / 2))) {
        cubes[source]++;
      }
    }
    return {deck, cubes, claimed: {tr25: [], tr35: []}};
  }

  /** Discarded postludes go to the postlude discard pile, not the project one. */
  public static attach(game: IGame): void {
    const state = game.postludes;
    if (state === undefined) {
      return;
    }
    game.projectDeck.postludeSink = (card) => state.deck.discard(card);
  }

  public static serialize(state: PostludesState): SerializedPostludes {
    return {
      deck: state.deck.serialize(),
      cubes: {...state.cubes},
      claimed: {tr25: [...state.claimed.tr25], tr35: [...state.claimed.tr35]},
    };
  }

  public static deserialize(serialized: SerializedPostludes, rng: Random): PostludesState {
    const cubes = {} as Record<PostludeSource, number>;
    for (const source of POSTLUDE_SOURCES) {
      cubes[source] = serialized.cubes[source] ?? 0;
    }
    return {
      deck: PostludeDeck.deserialize(serialized.deck, rng),
      cubes,
      claimed: {tr25: [...(serialized.claimed?.tr25 ?? [])], tr35: [...(serialized.claimed?.tr35 ?? [])]},
    };
  }

  // ---- Gaining postludes ----------------------------------------------------------------------------------------

  /**
   * `player` met the condition `reason`. The cube spaces have a limited number of postludes; funding an
   * award never runs out. The player draws four postludes and keeps one.
   */
  public static gain(player: IPlayer, reason: PostludeReason): void {
    const game = player.game;
    const state = game.postludes;
    if (state === undefined) {
      return;
    }
    if (reason !== 'award') {
      if (state.cubes[reason] <= 0) {
        game.log('${0} met the ${1} postlude condition, but no postludes are left there', (b) => b.player(player).string(reason));
        return;
      }
      state.cubes[reason]--;
    }
    game.log('${0} gained a postlude (${1})', (b) => b.player(player).string(reason));
    game.defer(new ChoosePostlude(player));
  }

  /** Called whenever a player's terraform rating goes up. The first to reach 25 and 35 each gain a postlude. */
  public static onTerraformRatingChanged(player: IPlayer): void {
    const state = player.game.postludes;
    if (state === undefined) {
      return;
    }
    for (const key of ['tr25', 'tr35'] as const) {
      if (player.terraformRating >= TR_POSTLUDE_THRESHOLDS[key] && !state.claimed[key].includes(player.id)) {
        state.claimed[key].push(player.id);
        this.gain(player, key);
      }
    }
  }

  /** At the start of generation 7 the postludes on that space go to the players in turn order. */
  public static onGenerationStart(game: IGame): void {
    const state = game.postludes;
    if (state === undefined || game.generation !== POSTLUDE_GENERATION) {
      return;
    }
    for (const player of game.playersInGenerationOrder) {
      if (state.cubes.generation7 <= 0) {
        break;
      }
      this.gain(player, 'generation7');
    }
  }

  public static onAwardFunded(player: IPlayer): void {
    this.gain(player, 'award');
  }

  // ---- Where postludes can go -------------------------------------------------------------------------------

  /** The postlude cards `player` has played. */
  public static played(player: IPlayer): Array<IPostludeCard> {
    return player.tableau.asArray().filter(isPostludeCard) as Array<IPostludeCard>;
  }

  /** A player needs an ocean track that's ahead of the number of ocean postludes they already own. */
  public static canPlaceOcean(player: IPlayer): boolean {
    const position = player.individualTracksData?.positions.oceans ?? 0;
    return position > this.played(player).filter((card) => card.postludeKind === 'ocean').length;
  }

  /** Cities, including those with domes, Lunar Habitats and Venus Habitats. */
  private static citySpaces(player: IPlayer): Array<Space> {
    const game = player.game;
    return [
      ...game.board.spaces.filter((space) => Board.isCitySpace(space) && Board.spaceOwnedBy(space, player)),
      ...MoonExpansion.spaces(game, TileType.MOON_HABITAT, {ownedBy: player}),
    ];
  }

  /** The spaces where a postlude of `kind` could go for `player`, not counting the card's own conditions. */
  public static spacesFor(player: IPlayer, kind: PostludeKind): Array<Space> {
    const game = player.game;
    let spaces: Array<Space>;
    switch (kind) {
    case 'city':
      spaces = this.citySpaces(player);
      break;
    case 'greenery':
      // Wilderness are excluded.
      spaces = game.board.spaces.filter((space) =>
        space.tile?.tileType === TileType.GREENERY && space.tile.upgrade !== 'wilderness' && Board.spaceOwnedBy(space, player));
      break;
    case 'ocean':
      spaces = this.canPlaceOcean(player) ? game.board.spaces.filter(Board.isUncoveredOceanSpace) : [];
      break;
    }
    return spaces.filter((space) => space.tile?.postlude === undefined);
  }

  /** Puts `card` on `space` and logs it. The tile underneath still counts as what it was. */
  public static place(player: IPlayer, card: IProjectCard, space: Space): void {
    if (space.tile === undefined || space.tile.postlude !== undefined) {
      throw new Error(`Cannot place ${card.name} on space ${space.id}`);
    }
    space.tile.postlude = card.name;
    player.game.log('${0} placed ${1} on space ${2}', (b) => b.player(player).card(card).string(space.id));
  }

  // ---- Looking around a postlude -----------------------------------------------------------------------------

  /** The space where the postlude `name` was placed. */
  public static spaceOf(game: IGame, name: CardName): Space | undefined {
    const onMars = game.board.spaces.find((space) => space.tile?.postlude === name);
    if (onMars !== undefined) {
      return onMars;
    }
    return game.moonData?.moon.spaces.find((space) => space.tile?.postlude === name);
  }

  public static neighbors(game: IGame, space: Space): ReadonlyArray<Space> {
    if (game.moonData !== undefined && game.moonData.moon.spaces.includes(space)) {
      return game.moonData.moon.getAdjacentSpaces(space);
    }
    return game.board.getAdjacentSpaces(space);
  }

  /** The spaces next to the postlude `name`. */
  public static adjacentTo(game: IGame, name: CardName): ReadonlyArray<Space> {
    const space = this.spaceOf(game, name);
    return space === undefined ? [] : this.neighbors(game, space);
  }

  /** Spaces next to the postlude with a real tile (not a hazard). */
  public static adjacentTiles(game: IGame, name: CardName): Array<Space> {
    return this.adjacentTo(game, name).filter(Board.hasRealTile);
  }

  public static adjacentEmpty(game: IGame, name: CardName): Array<Space> {
    return this.adjacentTo(game, name).filter((space) => space.tile === undefined);
  }

  /**
   * Spaces that count as 'Special tiles' for Re-Development Office: any tile that isn't a city, greenery or
   * ocean, and any tile with a postlude, since postludes are Special tiles.
   */
  public static isSpecialTile(space: Space): boolean {
    const tile = space.tile;
    if (tile === undefined) {
      return false;
    }
    if (tile.postlude !== undefined) {
      return true;
    }
    return !Board.isCitySpace(space) && !Board.isOceanSpace(space) && !Board.isGreenerySpace(space) && Board.hasRealTile(space);
  }

  /** Every space no more than `distance` steps from `origin`, including it. */
  public static withinDistance(game: IGame, origin: Space, distance: number): Array<Space> {
    const seen = new Set<Space>([origin]);
    let frontier: Array<Space> = [origin];
    for (let step = 0; step < distance; step++) {
      const next: Array<Space> = [];
      for (const space of frontier) {
        for (const adjacent of this.neighbors(game, space)) {
          if (!seen.has(adjacent)) {
            seen.add(adjacent);
            next.push(adjacent);
          }
        }
      }
      frontier = next;
    }
    return [...seen];
  }

  // ---- Effects on tile placement -------------------------------------------------------------------------------

  /** Amusement Park: a player's placement bonus doubles on a space next to their own Amusement Park. */
  public static doublesPlacementBonus(player: IPlayer, space: Space): boolean {
    if (!this.enabled(player.game)) {
      return false;
    }
    return this.neighbors(player.game, space).some((adjacent) =>
      adjacent.tile?.postlude === CardName.AMUSEMENT_PARK && Board.spaceOwnedBy(adjacent, player));
  }

  /** Ocean postludes give their adjacency bonus to whoever places a tile next to them. */
  public static onTilePlaced(player: IPlayer, space: Space): void {
    if (!this.enabled(player.game)) {
      return;
    }
    for (const adjacent of this.neighbors(player.game, space)) {
      const name = adjacent.tile?.postlude;
      const bonus = name === undefined ? undefined : POSTLUDE_ADJACENCY[name];
      if (name === undefined || bonus === undefined) {
        continue;
      }
      this.grantAdjacencyBonus(player, name, bonus);
    }
  }

  private static grantAdjacencyBonus(player: IPlayer, name: CardName, bonus: NonNullable<typeof POSTLUDE_ADJACENCY[CardName]>): void {
    const game = player.game;
    if ('stock' in bonus) {
      player.stock.add(bonus.stock, bonus.count, {log: true});
    } else if ('cardResource' in bonus) {
      this.addResourceToAnyCard(player, bonus.cardResource, 1);
    } else if ('cards' in bonus) {
      player.drawCard(bonus.cards);
    } else {
      game.defer(new SimpleDeferredAction(player, () => new SelectResource(message('Gain ${0} standard resource from ${1}', (b) => b.number(bonus.standardResource).cardName(name)))
        .andThen((resource) => {
          player.stock.add(resource, bonus.standardResource, {log: true});
          return undefined;
        })));
    }
    game.log('${0} gained the adjacency bonus of ${1}', (b) => b.player(player).cardName(name));
  }

  /** Adds `count` of `resource` to one card of the player's choice. */
  public static addResourceToAnyCard(player: IPlayer, resource: CardResource, count: number): void {
    player.game.defer(new AddResourcesToCard(player, resource, {count}));
  }

  // ---- Other effects -------------------------------------------------------------------------------------------

  /**
   * Insurance HQ: when a player loses a resource or production to another effect, they get as many of the same
   * resource or production as there are tiles next to their Insurance HQ.
   */
  public static onLoss(player: IPlayer, resource: Resource, _amount: number, production: boolean): void {
    if (!this.enabled(player.game) || !player.tableau.has(CardName.INSURANCE_HQ)) {
      return;
    }
    const count = this.adjacentTiles(player.game, CardName.INSURANCE_HQ).length;
    if (count === 0) {
      return;
    }
    player.game.log('${0} is insured by ${1}', (b) => b.player(player).cardName(CardName.INSURANCE_HQ));
    if (production) {
      player.production.add(resource, count, {log: true});
    } else {
      player.stock.add(resource, count, {log: true});
    }
  }

  // ---- Machinery Factory and Metallurgy Workshop ---------------------------------------------------------------

  /** The standard projects that place a tile, and the spaces where that tile could go. */
  private static projectSpaces(player: IPlayer, project: CardName): ReadonlyArray<Space> {
    const board = player.game.board;
    switch (project) {
    case CardName.CITY_STANDARD_PROJECT:
      return board.getAvailableSpacesForCity(player);
    case CardName.GREENERY_STANDARD_PROJECT:
      return board.getAvailableSpacesForGreenery(player);
    case CardName.AQUIFER_STANDARD_PROJECT:
      return player.game.canAddOcean() ? board.getAvailableSpacesForOcean(player) : [];
    default:
      // Industry tiles go on any free land.
      return INDUSTRY_STANDARD_PROJECTS.has(project) ? board.getAvailableSpacesOnLand(player) : [];
    }
  }

  /**
   * The spaces where `project`'s tile can go if `player` pays with `resource` thanks to a postlude: steel with
   * Machinery Factory, titanium with Metallurgy Workshop. Only spaces next to that postlude count.
   */
  private static paymentSpaces(player: IPlayer, project: CardName, resource: 'steel' | 'titanium'): ReadonlyArray<Space> {
    const name = resource === 'steel' ? CardName.MACHINERY_FACTORY : CardName.METALLURGY_WORKSHOP;
    if (!this.enabled(player.game) || !player.tableau.has(name)) {
      return [];
    }
    const adjacent = this.adjacentTo(player.game, name);
    return this.projectSpaces(player, project).filter((space) => adjacent.includes(space));
  }

  /** Machinery Factory and Metallurgy Workshop let tile standard projects take steel or titanium, but only next to them. */
  public static standardProjectPayWith(player: IPlayer, project: IStandardProjectCard, base: StandardProjectCanPayWith): StandardProjectCanPayWith {
    const result = {...base};
    for (const resource of ['steel', 'titanium'] as const) {
      if (result[resource] !== true && this.paymentSpaces(player, project.name, resource).length > 0) {
        result[resource] = true;
      }
    }
    return result;
  }

  /**
   * When a standard project was paid with steel or titanium that only a postlude allows, the tile has to go next to
   * that postlude. Returns those spaces, or undefined when the payment doesn't depend on a postlude.
   */
  public static placementSpaces(player: IPlayer, project: CardName, payment: Payment, base: StandardProjectCanPayWith): ReadonlyArray<Space> | undefined {
    let spaces: Array<Space> | undefined = undefined;
    for (const resource of ['steel', 'titanium'] as const) {
      if (payment[resource] > 0 && base[resource] !== true) {
        spaces = [...(spaces ?? []), ...this.paymentSpaces(player, project, resource)];
      }
    }
    return spaces;
  }

  /** Soil Enrichment Lab: a greenery placed on `space` costs `player` one plant less if the Lab is next to it. */
  public static hasSoilLabNextTo(player: IPlayer, space: Space): boolean {
    if (!this.enabled(player.game) || !player.tableau.has(CardName.SOIL_ENRICHMENT_LAB)) {
      return false;
    }
    const lab = this.spaceOf(player.game, CardName.SOIL_ENRICHMENT_LAB);
    return lab !== undefined && this.neighbors(player.game, space).includes(lab);
  }

  /**
   * Astro-University: every city no more than two tiles away from it (itself included) scores 1 more VP for each
   * greenery next to that city, for the city's owner.
   */
  public static calculateVictoryPoints(player: IPlayer, builder: VictoryPointsBreakdownBuilder): void {
    const game = player.game;
    if (!this.enabled(game)) {
      return;
    }
    const university = this.spaceOf(game, CardName.ASTRO_UNIVERSITY);
    if (university === undefined) {
      return;
    }
    let points = 0;
    for (const city of this.withinDistance(game, university, 2)) {
      if (Board.isCitySpace(city) && Board.spaceOwnedBy(city, player)) {
        points += this.neighbors(game, city).filter(Board.isGreenerySpace).length;
      }
    }
    if (points > 0) {
      builder.setVictoryPoints('victoryPoints', points, CardName.ASTRO_UNIVERSITY);
    }
  }
}
