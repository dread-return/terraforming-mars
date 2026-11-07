import {IPlayer} from '../../IPlayer';
import {IGame} from '../../IGame';
import {Space} from '../../boards/Space';
import {Board} from '../../boards/Board';
import {SpaceType} from '../../../common/boards/SpaceType';
import {SpaceBonus} from '../../../common/boards/SpaceBonus';
import {CardName} from '../../../common/cards/CardName';
import {TileType} from '../../../common/TileType';
import {SelectSpace} from '../../inputs/SelectSpace';
import {SelectOption} from '../../inputs/SelectOption';
import {PlayerInput} from '../../PlayerInput';
import {ICard} from '../ICard';
import {CardResource} from '../../../common/CardResource';
import {SelectCard} from '../../inputs/SelectCard';
import {SelectAmount} from '../../inputs/SelectAmount';
import {Behavior} from '../../behavior/Behavior';

/**
 * Engine hooks and helpers shared by the Ides of Mars (GIGA) cards.
 */
export class IdesOfMars {
  // ---- Insect Pollinators -------------------------------------------------

  /** Plants needed to place a greenery from plants on `space`. */
  public static plantsForGreeneryOn(player: IPlayer, space: Space): number {
    let cost = player.plantsNeededForGreenery;
    if (player.tableau.has(CardName.INSECT_POLLINATORS)) {
      const nextToOwnGreenery = player.game.board.getAdjacentSpaces(space)
        .some((adj) => Board.isGreenerySpace(adj) && Board.ownedBy(player)(adj));
      if (nextToOwnGreenery) {
        cost -= 1;
      }
    }
    return Math.max(cost, 0);
  }

  /** The greenery spaces `player` can afford with their plants right now. */
  public static affordableGreenerySpaces(player: IPlayer): ReadonlyArray<Space> {
    return player.game.board.getAvailableSpacesForGreenery(player)
      .filter((space) => player.plants >= this.plantsForGreeneryOn(player, space));
  }

  /** The fewest plants `player` needs to place a greenery somewhere. */
  public static minPlantsForGreenery(player: IPlayer): number {
    if (!player.tableau.has(CardName.INSECT_POLLINATORS)) {
      return player.plantsNeededForGreenery;
    }
    const spaces = player.game.board.getAvailableSpacesForGreenery(player);
    if (spaces.length === 0) {
      return player.plantsNeededForGreenery;
    }
    return Math.min(...spaces.map((space) => this.plantsForGreeneryOn(player, space)));
  }

  // ---- Administrative Delay ----------------------------------------------

  /** A "skip this turn" option, when Administrative Delay was played this generation. */
  public static skipTurnOption(player: IPlayer): PlayerInput | undefined {
    const card = player.tableau.get(CardName.ADMINISTRATIVE_DELAY);
    if (card === undefined || card.generationUsed !== player.game.generation) {
      return undefined;
    }
    if (player.actionsTakenThisRound > 0) {
      return undefined;
    }
    return new SelectOption('Skip this turn without passing (Administrative Delay)', 'Skip turn').andThen(() => {
      player.actionsTakenThisRound = player.availableActionsThisRound;
      player.game.log('${0} skipped their turn (${1})', (b) => b.player(player).cardName(CardName.ADMINISTRATIVE_DELAY));
      return undefined;
    });
  }

  // ---- Backstabbing -------------------------------------------------------

  /**
   * The player who becomes chairman instead of the party leader thanks to Backstabbing,
   * or undefined. `hasDelegate` says whether a player has a delegate in the winning party.
   */
  public static backstabber(game: IGame, hasDelegate: (player: IPlayer) => boolean): IPlayer | undefined {
    return game.playersInGenerationOrder.find((player) => {
      const card = player.tableau.get(CardName.BACKSTABBING);
      return card !== undefined && card.generationUsed === game.generation && hasDelegate(player);
    });
  }

  // ---- Hidden City --------------------------------------------------------

  /**
   * After final greenery placement, each Hidden City owner places a city on Mars.
   * Returns true when a player was asked to place one (the caller should stop and wait).
   */
  public static takeHiddenCityAction(game: IGame, next: () => void): boolean {
    for (const player of game.playersInGenerationOrder) {
      const card = player.tableau.get(CardName.HIDDEN_CITY);
      if (card === undefined || card.generationUsed !== undefined) {
        continue;
      }
      card.generationUsed = game.generation;
      const spaces = game.board.getAvailableSpacesForCity(player);
      if (spaces.length === 0) {
        game.log('${0} has no space left for ${1}: it is placed outside the map', (b) => b.player(player).cardName(CardName.HIDDEN_CITY));
        continue;
      }
      game.activePlayer = player;
      player.setWaitingFor(new SelectSpace('Select space for the Hidden City', spaces).andThen((space) => {
        game.addCity(player, space, CardName.HIDDEN_CITY);
        return undefined;
      }), () => game.deferredActions.runAll(next));
      return true;
    }
    return false;
  }

  // ---- Martian Infrastructures --------------------------------------------

  /** M€ discount on card actions that place a tile on Mars. */
  public static readonly MARS_TILE_ACTION_DISCOUNT = 2;

  /** How much less `player` pays for a card action that places a tile on Mars. */
  public static marsTileActionDiscount(player: IPlayer): number {
    return player.tableau.has(CardName.MARTIAN_INFRASTRUCTURES) ? this.MARS_TILE_ACTION_DISCOUNT : 0;
  }

  /** True when the behavior places a tile on Mars (city, greenery, ocean or special tile). */
  public static placesTileOnMars(player: IPlayer, behavior: Behavior): boolean {
    if (behavior.greenery !== undefined || behavior.ocean !== undefined || behavior.tile !== undefined) {
      return true;
    }
    if (behavior.city !== undefined) {
      const spaceId = behavior.city.space;
      return spaceId === undefined || player.game.board.getSpaceOrThrow(spaceId).spaceType !== SpaceType.COLONY;
    }
    return false;
  }

  /** The M€ a card action costs after Martian Infrastructures. */
  public static actionMegacredits(player: IPlayer, behavior: Behavior, megacredits: number): number {
    if (!this.placesTileOnMars(player, behavior)) {
      return megacredits;
    }
    return Math.max(0, megacredits - this.marsTileActionDiscount(player));
  }

  // ---- Shared bits ----------------------------------------------------------

  /** Empty land areas on Mars that aren't reserved (Precious Metal Asteroid). */
  public static emptyUnreservedLand(player: IPlayer): ReadonlyArray<Space> {
    return player.game.board.spaces.filter((space) =>
      space.spaceType === SpaceType.LAND &&
      space.tile === undefined &&
      space.player === undefined &&
      !space.bonus.includes(SpaceBonus.INCENTIVE_5MC));
  }

  /** True when `space` holds a city tile placed on Mars. */
  public static isTileOnMars(space: Space): boolean {
    return space.spaceType !== SpaceType.COLONY;
  }

  /** True when the tile on `space` is an ocean. */
  public static isOcean(space: Space): boolean {
    return Board.isOceanSpace(space);
  }

  /** Card resources of `type` held on cards owned by any player. */
  public static cardsWithResources(game: IGame, types: ReadonlyArray<CardResource>): Array<{owner: IPlayer, card: ICard}> {
    const result: Array<{owner: IPlayer, card: ICard}> = [];
    for (const owner of game.players) {
      for (const card of owner.tableau) {
        if (card.resourceType !== undefined && types.includes(card.resourceType) && card.resourceCount > 0) {
          result.push({owner, card});
        }
      }
    }
    return result;
  }

  /**
   * Moves up to `max` resources of `type` from one of `player`'s cards to another.
   */
  public static moveResources(player: IPlayer, type: CardResource, max: number): PlayerInput | undefined {
    const cards = player.getResourceCards(type);
    const sources = cards.filter((card) => card.resourceCount > 0);
    if (cards.length < 2 || sources.length === 0) {
      return undefined;
    }
    return new SelectCard(`Select a card to move ${type}s from (or skip)`, 'Move', sources, {min: 0, max: 1})
      .andThen(([source]) => {
        if (source === undefined) {
          return undefined;
        }
        const targets = cards.filter((card) => card.name !== source.name);
        const most = Math.min(max, source.resourceCount);
        return new SelectAmount(`Select how many ${type}s to move`, 'Move', 1, most, true).andThen((amount) => {
          return new SelectCard(`Select the card to move ${amount} ${type}(s) to`, 'Move', targets).andThen(([target]) => {
            player.removeResourceFrom(source, amount, {log: false});
            player.addResourceTo(target, {qty: amount, log: false});
            player.game.log('${0} moved ${1} ${2}(s) from ${3} to ${4}',
              (b) => b.player(player).number(amount).string(type).card(source).card(target));
            return undefined;
          });
        });
      });
  }

  /** The Invak City tile type, for card rendering. */
  public static readonly INVAK_CITY = TileType.INVAK_CITY;
}
