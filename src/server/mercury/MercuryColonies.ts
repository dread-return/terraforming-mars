import {CardResource} from '../../common/CardResource';
import {ColonyBenefit} from '../../common/colonies/ColonyBenefit';
import {ColonyName} from '../../common/colonies/ColonyName';
import {Resource} from '../../common/Resource';
import {IColony} from '../colonies/IColony';
import {AddResourcesToCard} from '../deferredActions/AddResourcesToCard';
import {DeferredAction, SimpleDeferredAction} from '../deferredActions/DeferredAction';
import {IGame} from '../IGame';
import {IPlayer} from '../IPlayer';
import {OrOptions} from '../inputs/OrOptions';
import {SelectOption} from '../inputs/SelectOption';
import {SelectResource} from '../inputs/SelectResource';
import {SelectColony} from '../inputs/SelectColony';
import {PlayerInput} from '../PlayerInput';
import {Mercury} from './Mercury';
import {MAX_COLONIES_PER_TILE} from '../../common/constants';

export const MERCURY_COLONY_NAMES: ReadonlyArray<ColonyName> = [ColonyName.MARKET_COLONIES, ColonyName.SHADOW_COLONIES];

export class MercuryColonies {
  /** Market Colonies joins every Mercury game, on top of the random colonies. */
  public static addMarketColonies(game: IGame, marketColonies: () => IColony): void {
    if (!game.gameOptions.mercuryExpansion || game.colonies.some((c) => c.name === ColonyName.MARKET_COLONIES)) {
      return;
    }
    game.colonies.push(marketColonies());
  }

  /** The colony tiles "on Mercury": Market Colonies, and Shadow Colonies when it is in the game. */
  public static mercuryColonies(game: IGame): Array<IColony> {
    return game.colonies.filter((c) => MERCURY_COLONY_NAMES.includes(c.name) && c.isActive);
  }

  /**
   * Where `player` may place a colony on Mercury. Only Mercurial Shadow Colony may use the reserved 4th space,
   * and may place it next to a colony of its own.
   */
  public static placeableOnMercury(player: IPlayer, options?: {reservedSpace?: boolean}): Array<IColony> {
    return this.mercuryColonies(player.game).filter((c) => {
      const limit = options?.reservedSpace === true ? (c.metadata.colonySpaces ?? MAX_COLONIES_PER_TILE) : MAX_COLONIES_PER_TILE;
      if (c.colonies.length >= limit) {
        return false;
      }
      return options?.reservedSpace === true || !c.colonies.includes(player.id);
    });
  }

  /** Total colonies on the Mercury colony tiles (New Pompeii). */
  public static coloniesOnMercury(game: IGame): number {
    return this.mercuryColonies(game).reduce((total, c) => total + c.colonies.length, 0);
  }

  /** "Place a colony on Mercury". Returns undefined when there is no room. */
  public static placeColonyOnMercury(player: IPlayer, options?: {reservedSpace?: boolean}): PlayerInput | undefined {
    const colonies = this.placeableOnMercury(player, options);
    if (colonies.length === 0) {
      player.game.log('There is no room for a colony on Mercury');
      return undefined;
    }
    return new SelectColony('Select where to build a colony on Mercury', 'Build', colonies)
      .andThen((colony) => {
        colony.addColony(player);
        return undefined;
      });
  }

  public static computeBonus(player: IPlayer, bonusType: ColonyBenefit, quantity: number, trackPosition: number): DeferredAction<any> | undefined {
    switch (bonusType) {
    case ColonyBenefit.GAIN_ASSETS:
      Mercury.gainAssets(player, quantity);
      return undefined;

    case ColonyBenefit.GAIN_SAME_STANDARD_RESOURCES:
      return new SimpleDeferredAction(player, () => new SelectResource(`Gain ${quantity} of the same standard resource`).andThen((unit) => {
        player.stock.add(unit, quantity, {log: true});
        return undefined;
      }));

    case ColonyBenefit.GAIN_STANDARD_RESOURCE:
      return new SimpleDeferredAction(player, () => new SelectResource('Gain 1 standard resource').andThen((unit) => {
        player.stock.add(unit, quantity, {log: true});
        return undefined;
      }));

    case ColonyBenefit.MARKET_TRADE:
      return new SimpleDeferredAction(player, () => Mercury.marketTrade(player, (resource, count) => {
        player.game.defer(new AddResourcesToCard(player, resource, {count, fromColony: true}));
      }));

    case ColonyBenefit.VENUS_STEP_OR_ASTEROID:
      return new SimpleDeferredAction(player, () => {
        const options = new OrOptions().setTitle('The Asteroid Belt colony bonus');
        if (player.game.gameOptions.venusNextExtension) {
          options.options.push(new SelectOption('Raise Venus 1 step').andThen(() => {
            player.game.increaseVenusScaleLevel(player, 1);
            return undefined;
          }));
        }
        options.options.push(new SelectOption('Add 1 asteroid to a card').andThen(() => {
          player.game.defer(new AddResourcesToCard(player, CardResource.ASTEROID, {count: 1, fromColony: true}));
          return undefined;
        }));
        return options;
      });

    case ColonyBenefit.ASTEROID_BELT_TRADE:
      return this.asteroidBeltTrade(player, trackPosition);

    default:
      throw new Error('Unsupported benefit type');
    }
  }

  /** The Asteroid Belt trade income, step by step. */
  private static asteroidBeltTrade(player: IPlayer, position: number): DeferredAction<any> | undefined {
    const game = player.game;
    const standard = (count: number) => {
      for (let i = 0; i < count; i++) {
        game.defer(new SimpleDeferredAction(player, () => new SelectResource('Gain 1 standard resource').andThen((unit) => {
          player.stock.add(unit, 1, {log: true});
          return undefined;
        })));
      }
    };
    const asteroids = (count: number) => game.defer(new AddResourcesToCard(player, CardResource.ASTEROID, {count, fromColony: true}));
    const anyResource = () => game.defer(new AddResourcesToCard(player, undefined, {count: 1, fromColony: true}));
    switch (position) {
    case 0:
      standard(1);
      break;
    case 1:
      standard(2);
      break;
    case 2:
      player.production.add(Resource.STEEL, 1, {log: true});
      break;
    case 3:
      asteroids(1);
      break;
    case 4:
      asteroids(1);
      player.stock.add(Resource.TITANIUM, 1, {log: true});
      break;
    case 5:
      asteroids(1);
      anyResource();
      break;
    default:
      asteroids(2);
      anyResource();
      break;
    }
    return undefined;
  }
}
