import {Board} from '../../boards/Board';
import {SelectPaymentDeferred} from '../../deferredActions/SelectPaymentDeferred';
import {InputError} from '../../inputs/InputError';
import {Units} from '../../../common/Units';
import {ALL_RESOURCES} from '../../../common/Resource';
import {TileType} from '../../../common/TileType';
import {Space} from '../../boards/Space';
import {SpaceId} from '../../../common/Types';
import {Tile} from '../../Tile';
import {CardName} from '../../../common/cards/CardName';
import {CardType} from '../../../common/cards/CardType';
import {Tag} from '../../../common/cards/Tag';
import {GlobalParameter} from '../../../common/GlobalParameter';
import {Resource} from '../../../common/Resource';
import {CardResource} from '../../../common/CardResource';
import {Phase} from '../../../common/Phase';
import {ColonyBenefit} from '../../../common/colonies/ColonyBenefit';
import {IPlayer} from '../../IPlayer';
import {IGame} from '../../IGame';
import {ICard} from '../ICard';
import {IProjectCard} from '../IProjectCard';
import {IColony} from '../../colonies/IColony';
import {From, isFromPlayer} from '../../logs/From';
import {OrOptions} from '../../inputs/OrOptions';
import {SelectOption} from '../../inputs/SelectOption';
import {AddResourcesToCard} from '../../deferredActions/AddResourcesToCard';
import {IGlobalEvent} from '../../turmoil/globalEvents/IGlobalEvent';
import {IStandardProjectCard} from '../IStandardProjectCard';
import {StandardProjectCanPayWith} from '../../../common/cards/Types';
import {SelectAmount} from '../../inputs/SelectAmount';
import {message} from '../../logs/MessageBuilder';
import {SelectResources} from '../../inputs/SelectResources';
import {SelectCard} from '../../inputs/SelectCard';
import {PlaceCityTile} from '../../deferredActions/PlaceCityTile';
import {PlayerInput} from '../../PlayerInput';
import {EpicUtils} from './EpicUtils';
import {sum} from '../../../common/utils/utils';
import {ICorporationCard} from '../corporation/ICorporationCard';

/** True Mars Foundation: the tag sets a player can mark (one per action). */
export const TRUE_MARS_FOUNDATION_SETS: ReadonlyArray<ReadonlyArray<Tag>> = [
  [Tag.POWER, Tag.MARS, Tag.BUILDING],
  [Tag.SPACE, Tag.JOVIAN],
  [Tag.SCIENCE, Tag.RADIOACTIVE],
  [Tag.PLANT, Tag.MICROBE, Tag.ANIMAL],
  [Tag.VENUS, Tag.MOON, Tag.EARTH],
];

type GenerationData = {generation?: number};
type RaisedData = GenerationData & {raised?: Array<Resource>};
type TmfData = GenerationData & {set?: number};

function dataOf<T>(card: ICard): T {
  if (card.data === undefined || card.data === null || typeof card.data !== 'object') {
    card.data = {};
  }
  return card.data as unknown as T;
}

function permutations<T>(items: ReadonlyArray<T>): Array<Array<T>> {
  if (items.length <= 1) {
    return [[...items]];
  }
  const result: Array<Array<T>> = [];
  items.forEach((item, i) => {
    const rest = [...items.slice(0, i), ...items.slice(i + 1)];
    for (const p of permutations(rest)) {
      result.push([item, ...p]);
    }
  });
  return result;
}

/**
 * Engine hooks for the Epic Corporations (part of Corporate Era in this fork).
 *
 * Each hook only does something when a player has the matching corporation,
 * so they are cheap no-ops otherwise.
 */
/** Epic corporations whose own resources can pay for some cards (see EpicHooks.epicPayment). */
const EPIC_PAYMENT_CORPS: ReadonlyArray<CardName> = [
  CardName.PEGASUS_GROUP, CardName.OMNIDRONE_LABS, CardName.STELLAR_ROBOTICS, CardName.TECHNONAUTS,
  CardName.XANTHUM, CardName.OCEANUS, CardName.SAGA_BIOENGINEERING, CardName.MICROFAC, CardName.TRON,
  CardName.UN_VENUS_INITIATIVE,
];

export class EpicHooks {
  /** Called whenever a player raises a global parameter during the action phase. */
  public static onGlobalParameterIncrease(activePlayer: IPlayer, parameter: GlobalParameter, steps: number): void {
    if (steps <= 0 || activePlayer.game === undefined) {
      return;
    }
    // Jump-Start Corporation: a wild resource per step you raise.
    const jumpStart = activePlayer.tableau.get(CardName.JUMP_START_CORPORATION);
    if (jumpStart !== undefined) {
      activePlayer.addResourceTo(jumpStart, {qty: steps, log: true});
    }
    for (const p of activePlayer.game.players) {
      // Barsoomian Atmospherics: 2 M€ per oxygen step raised by anyone, plus 2 energy when it's you.
      if (parameter === GlobalParameter.OXYGEN && p.tableau.has(CardName.BARSOOMIAN_ATMOSPHERICS)) {
        p.stock.add(Resource.MEGACREDITS, 2 * steps, {log: true});
        if (p.id === activePlayer.id) {
          p.stock.add(Resource.ENERGY, 2 * steps, {log: true});
        }
      }
      // Planetary Homeostasis Bureau: +1 M€ production per temperature step raised by anyone.
      if (parameter === GlobalParameter.TEMPERATURE && p.tableau.has(CardName.PLANETARY_HOMEOSTASIS_BUREAU)) {
        p.production.add(Resource.MEGACREDITS, steps, {log: true});
      }
    }
  }

  /** Called when a player uses the action on a card in their tableau. */
  public static onCardAction(player: IPlayer, card: ICard): void {
    // M.A.R.S.: 1 M€ each time you use the action of a blue card.
    if (card.type === CardType.ACTIVE && player.tableau.has(CardName.MARS_ACTIVE_RESOURCES)) {
      player.stock.add(Resource.MEGACREDITS, 1, {log: true});
    }
    // Kong.Inc: actions on blue cards don't cost a plant.
    const kong = player.tableau.get(CardName.KONG_INC);
    if (kong !== undefined && card.type === CardType.ACTIVE) {
      dataOf<{blueAction?: boolean}>(kong).blueAction = true;
    }
    // Technonauts: robots pay for this action (until the player's next action starts).
    const technonauts = player.tableau.get(CardName.TECHNONAUTS);
    if (technonauts !== undefined && card.name !== CardName.TECHNONAUTS) {
      dataOf<{inAction?: boolean}>(technonauts).inAction = true;
    }
  }

  /** Kong.Inc: with no plants, only blue-card actions (and its own action), passing and free actions are offered. */
  public static filterActions(player: IPlayer, action: OrOptions): void {
    // Imakita Industrial: no actions until generation 3, only passing.
    if (player.tableau.has(CardName.IMAKITA_INDUSTRIAL) && player.game.generation < 3) {
      action.options = action.options.filter((option) => String(option.title) === 'Pass for this generation' || option.constructor.name === 'UndoActionOption');
      return;
    }
    if (!player.tableau.has(CardName.KONG_INC) || player.plants > 0) {
      return;
    }
    const allowed = ['Perform an action from a played card', 'Pass for this generation', 'End Turn', 'Free conversions (Epic corporations)'];
    action.options = action.options.filter((option) => allowed.includes(String(option.title)) || option.constructor.name === 'UndoActionOption');
  }

  /**
   * TRON: once its owner has passed, each action another player takes adds an administration resource to TRON,
   * unless that player pays TRON 1 M€ instead.
   */
  private static tronAfterAction(player: IPlayer): void {
    const game = player.game;
    // Free actions, passing and ending the turn aren't actions.
    if (player.freeActionTaken || game.hasPassedThisActionPhase(player) || player.actionsTakenThisRound >= player.availableActionsThisRound) {
      return;
    }
    for (const owner of player.opponents) {
      const tron = owner.tableau.get(CardName.TRON);
      if (tron === undefined || !game.hasPassedThisActionPhase(owner)) {
        continue;
      }
      const admin = () => {
        owner.addResourceTo(tron, {qty: 1, log: true});
        return undefined;
      };
      if (player.megaCredits < 1) {
        admin();
        continue;
      }
      player.defer(new OrOptions(
        new SelectOption(message('Add an administration resource to ${0}\'s TRON', (b) => b.player(owner)), 'Add').andThen(admin),
        new SelectOption(message('Pay ${0} 1 M€', (b) => b.player(owner)), 'Pay').andThen(() => {
          player.stock.deduct(Resource.MEGACREDITS, 1, {log: true});
          owner.stock.add(Resource.MEGACREDITS, 1, {log: true, from: {card: CardName.TRON}});
          return undefined;
        }),
      ).setTitle('TRON has passed: for this action'));
    }
  }

  /** Kong.Inc: converting plants into a greenery needs 1 more plant (the action's plant). */
  public static extraPlantsForGreenery(player: IPlayer): number {
    return player.tableau.has(CardName.KONG_INC) ? 1 : 0;
  }

  /** Called when an action from the action menu has finished, before it's counted. */
  public static afterAction(player: IPlayer): void {
    EpicHooks.tronAfterAction(player);
    const kong = player.tableau.get(CardName.KONG_INC);
    if (kong === undefined) {
      return;
    }
    const data = dataOf<{blueAction?: boolean}>(kong);
    const blue = data.blueAction === true;
    data.blueAction = false;
    // Free actions, passing and ending the turn aren't actions.
    if (blue || player.freeActionTaken || player.game.hasPassedThisActionPhase(player) || player.actionsTakenThisRound >= player.availableActionsThisRound) {
      return;
    }
    if (player.plants > 0) {
      player.stock.deduct(Resource.PLANTS, 1, {log: true});
    }
  }

  /** Cloud Computing: at the start of the action phase, it may pay 3 M€ to act first. Returns true if it asked. */
  public static offerCloudPreTurn(game: IGame, startNormally: () => void): boolean {
    if (game.generation === 1) {
      return false;
    }
    const player = game.players.find((p) => p.tableau.has(CardName.CLOUD_COMPUTING));
    const cloud = player?.tableau.get(CardName.CLOUD_COMPUTING);
    if (player === undefined || cloud === undefined || player.megaCredits < 3) {
      return false;
    }
    player.setWaitingFor(new OrOptions(
      new SelectOption('Pay 3 M€ to take an action before the first player', 'Pay').andThen(() => {
        player.stock.deduct(Resource.MEGACREDITS, 3, {log: true});
        game.log('${0} takes an action before the first player (Cloud Computing)', (b) => b.player(player));
        dataOf<{preTurn?: boolean}>(cloud).preTurn = true;
        player.actionsTakenThisRound = 0;
        player.availableActionsThisRound = 1;
        game.activePlayer = player;
        player.takeAction();
        return undefined;
      }),
      new SelectOption('Don\'t').andThen(() => {
        startNormally();
        return undefined;
      }),
    ).setTitle('Cloud Computing'));
    return true;
  }

  /** Cloud Computing: its extra action is over, so the generation starts with the first player. */
  public static endCloudPreTurn(game: IGame): boolean {
    for (const player of game.players) {
      const cloud = player.tableau.get(CardName.CLOUD_COMPUTING);
      if (cloud !== undefined && dataOf<{preTurn?: boolean}>(cloud).preTurn === true) {
        // The turn-end code in Player.takeAction has already reset its actions per turn.
        dataOf<{preTurn?: boolean}>(cloud).preTurn = false;
        return true;
      }
    }
    return false;
  }

  /** Called as a player's next action starts: card-action effects are over. */
  public static onTakeAction(player: IPlayer): void {
    // Archi-Tech: the refund only applies to what's paid during this action.
    const archiTech = player.tableau?.get(CardName.ARCHI_TECH);
    if (archiTech !== undefined) {
      dataOf<{lastCost?: number}>(archiTech).lastCost = 0;
    }
    const technonauts = player.tableau?.get(CardName.TECHNONAUTS);
    if (technonauts !== undefined) {
      dataOf<{inAction?: boolean}>(technonauts).inAction = false;
    }
  }

  /** Technonauts: robots worth 6 M€ each while paying for a card action. */
  public static actionPaymentValue(player: IPlayer): number | undefined {
    const technonauts = player.tableau.get(CardName.TECHNONAUTS);
    if (technonauts === undefined || technonauts.resourceCount === 0) {
      return undefined;
    }
    return dataOf<{inAction?: boolean}>(technonauts).inAction === true ? 6 : undefined;
  }

  /** Extra cards to look at during the research phase (Leviathan, Logos Research & Development). */
  public static extraResearchCards(player: IPlayer): number {
    let extra = 0;
    if (player.tableau.has(CardName.LEVIATHAN)) {
      extra++;
    }
    if (player.tableau.has(CardName.LOGOS_RESEARCH_AND_DEVELOPMENT)) {
      extra++;
    }
    return extra;
  }

  /** Cards a player may keep for free during the research phase (Logos Research & Development). */
  public static freeResearchCards(player: IPlayer): number {
    return player.tableau.has(CardName.LOGOS_RESEARCH_AND_DEVELOPMENT) ? 1 : 0;
  }

  /** Lazarus Laboratories: after buying research cards, keep one of your discarded ones for free. */
  public static keepsDiscardedResearchCard(player: IPlayer): boolean {
    return player.tableau.has(CardName.LAZARUS_LABORATORIES);
  }

  /** Called when cards go into a player's hand, either bought or drawn (Dev Wright). */
  public static onCardsKept(player: IPlayer, count: number, bought: boolean): void {
    // Dynamic Business Services (Earth effect): 1 M€ per card drawn.
    const dbs = player.tableau?.get(CardName.DYNAMIC_BUSINESS_SERVICES);
    if (count > 0 && !bought && dbs !== undefined && (dbs as unknown as {active(p: IPlayer): Tag | undefined}).active(player) === Tag.EARTH) {
      player.stock.add(Resource.MEGACREDITS, count, {log: true, from: {card: CardName.DYNAMIC_BUSINESS_SERVICES}});
    }
    if (count > 0 && player.tableau.has(CardName.DEV_WRIGHT)) {
      player.stock.add(Resource.MEGACREDITS, (bought ? 1 : 2) * count, {log: true});
    }
    // ProfiCoin: 1 M€ per card bought outside the research phase; research purchases are paid out at its end.
    if (count > 0 && bought && player.game !== undefined) {
      const researching = player.game.phase === Phase.RESEARCH || player.game.phase === Phase.DRAFTING;
      for (const p of player.game.players) {
        const proficoin = p.tableau.get(CardName.PROFICOIN);
        if (proficoin === undefined) {
          continue;
        }
        if (researching) {
          const data = dataOf<{researchBought?: number}>(proficoin);
          data.researchBought = (data.researchBought ?? 0) + count;
        } else {
          p.stock.add(Resource.MEGACREDITS, count, {log: true});
        }
      }
    }
  }

  /** ProfiCoin: 1 M€ per 2 cards bought by all players during the research phase. */
  public static onResearchPhaseEnd(game: IGame): void {
    for (const p of game.players) {
      const proficoin = p.tableau.get(CardName.PROFICOIN);
      if (proficoin === undefined) {
        continue;
      }
      const data = dataOf<{researchBought?: number}>(proficoin);
      const gain = Math.floor((data.researchBought ?? 0) / 2);
      data.researchBought = 0;
      if (gain > 0) {
        p.stock.add(Resource.MEGACREDITS, gain, {log: true});
      }
    }
  }

  /**
   * Cheap Chispa: every decrease of the owner's energy production is 1 step smaller.
   * Returns the adjusted amount.
   */
  /**
   * Archi-Tech: when an opponent places a tile next to one of its marked areas, Archi-Tech gets the
   * area's placement bonus instead. Returns who gets the bonus.
   */
  public static placementBonusRecipient(player: IPlayer, space: Space): IPlayer {
    const game = player.game;
    for (const other of player.opponents) {
      const card = other.tableau.get(CardName.ARCHI_TECH);
      const marks = card === undefined ? undefined : dataOf<{marks?: Array<SpaceId>}>(card).marks;
      if (marks !== undefined && game.board.getAdjacentSpaces(space).some((s) => marks.includes(s.id))) {
        if (space.bonus.length > 0) {
          game.log('${0} takes the placement bonus of ${1} (Archi-Tech)', (b) => b.player(other).space(space));
        }
        return other;
      }
    }
    return player;
  }

  /** Moar: gain 1 more of one of the resources just gained. */
  public static moarExtra(player: IPlayer, resources: ReadonlyArray<Resource>): void {
    if (!player.tableau.has(CardName.MOAR)) {
      return;
    }
    const unique = [...new Set(resources)];
    if (unique.length === 0) {
      return;
    }
    const gain = (resource: Resource) => player.stock.add(resource, 1, {log: true, from: {card: CardName.MOAR}});
    if (unique.length === 1) {
      gain(unique[0]);
      return;
    }
    player.defer(new OrOptions(...unique.map((resource) => new SelectOption(`Gain 1 ${resource}`).andThen(() => {
      gain(resource);
      return undefined;
    }))).setTitle('Moar: gain 1 more of'));
  }

  /** Moar: the stock before something that may give it resources (undefined for anyone else). */
  public static moarBefore(player: IPlayer): Units | undefined {
    return player.tableau?.has(CardName.MOAR) === true ? player.stock.asUnits() : undefined;
  }

  /** Moar: after something that may have given it resources, gain 1 more of one of them. */
  public static moarAfter(player: IPlayer, before: Units | undefined): void {
    if (before === undefined) {
      return;
    }
    const after = player.stock.asUnits();
    EpicHooks.moarExtra(player, ALL_RESOURCES.filter((resource) => after[resource] > before[resource]));
  }

  /** UN Venus Initiative: whether a card or standard project raises Venus (so Venus funds can pay for it). */
  public static raisesVenus(card: ICard): boolean {
    if (card.name === CardName.AIR_SCRAPPING_STANDARD_PROJECT || card.name === CardName.AIR_SCRAPPING_STANDARD_PROJECT_VARIANT) {
      return true;
    }
    const venus = card.behavior?.global?.venus;
    if (typeof venus === 'number' && venus > 0) {
      return true;
    }
    const tr = card.tr;
    return tr !== undefined && typeof tr.venus === 'number' && tr.venus > 0;
  }

  /**
   * Achievement Unlocked: VP for one of its milestone claims. The first 3 claims of the game are worth 5 VP;
   * claims beyond those, or of a milestone someone else claimed first, are worth 2 VP.
   */
  public static milestoneVictoryPoints(player: IPlayer, index: number, limit: number): number {
    if (!player.tableau.has(CardName.ACHIEVEMENT_UNLOCKED)) {
      return 5;
    }
    const claims = player.game.claimedMilestones;
    const claim = claims[index];
    const shared = claims.slice(0, index).some((c) => c.milestone.name === claim.milestone.name);
    const uniqueBefore = new Set(claims.slice(0, index).map((c) => c.milestone.name)).size;
    return !shared && uniqueBefore < limit ? 5 : 2;
  }

  /** Soviet Mars: its tiles on Mars must go next to its own tiles, if possible. */
  public static sovietAdjacency(player: IPlayer, board: Board, spaces: ReadonlyArray<Space>): ReadonlyArray<Space> {
    if (player.tableau?.has(CardName.SOVIET_MARS) !== true) {
      return spaces;
    }
    const next = spaces.filter((space) => board.getAdjacentSpaces(space).some((a) => a.tile !== undefined && a.player === player));
    return next.length > 0 ? next : spaces;
  }

  /** Eletrop: sets its energy production to the total energy production of its opponents. */
  public static syncEletrop(game: IGame): void {
    const eletrop = game.players.find((p) => p.tableau.has(CardName.ELETROP));
    if (eletrop === undefined) {
      return;
    }
    eletrop.production.energy = sum(eletrop.opponents.map((p) => p.production.energy));
  }

  /** Eletrop: each step of energy production it would lose costs 2 energy instead. */
  public static eletropCanLoseEnergyProduction(player: IPlayer, steps: number): boolean {
    return player.energy >= 2 * steps;
  }

  /** Cold Fusion: runs `fn` with the player's energy production counted as 0 (milestones and awards). */
  public static withoutColdFusionEnergy<T>(player: IPlayer, fn: () => T): T {
    if (player.tableau?.has(CardName.COLD_FUSION) !== true) {
      return fn();
    }
    const saved = player.production.energy;
    player.production.energy = 0;
    try {
      return fn();
    } finally {
      player.production.energy = saved;
    }
  }

  public static adjustProductionChange(player: IPlayer, resource: Resource, amount: number): number {
    // Eletrop: its energy production can't change. Raises are ignored; each step it would lose costs 2 energy
    // (as much as it has, when an opponent lowers it).
    if (resource === Resource.ENERGY && amount !== 0 && player.tableau.has(CardName.ELETROP)) {
      if (amount > 0) {
        player.game.log('${0} can\'t raise energy production (Eletrop)', (b) => b.player(player));
      } else {
        const cost = Math.min(player.energy, -2 * amount);
        if (cost > 0) {
          player.stock.deduct(Resource.ENERGY, cost, {log: true});
        }
      }
      return 0;
    }
    if (resource === Resource.ENERGY && amount < 0 && player.tableau.has(CardName.CHEAP_CHISPA)) {
      return amount + 1;
    }
    return amount;
  }

  /** Called after a player's production changed by `delta` (negative is a loss). */
  public static onProductionChange(player: IPlayer, resource: Resource, delta: number, from?: From): void {
    if (delta === 0) {
      return;
    }
    const game = player.game;
    if (game === undefined) {
      return;
    }
    // Tholus: frames follow steel production changes.
    if (resource === Resource.STEEL) {
      const tholus = player.tableau.get(CardName.THOLUS);
      if (tholus !== undefined) {
        if (delta > 0) {
          player.addResourceTo(tholus, {qty: delta, log: true});
        } else {
          const qty = Math.min(-delta, tholus.resourceCount);
          if (qty > 0) {
            player.removeResourceFrom(tholus, qty);
          }
        }
      }
    }
    // Eletrop follows its opponents' energy production.
    if (resource === Resource.ENERGY) {
      EpicHooks.syncEletrop(game);
    }
    const fromOtherPlayer = isFromPlayer(from) && from.player.id !== player.id;

    // Discount Conglomerate: a wild resource whenever your production is lowered.
    const discount = player.tableau.get(CardName.DISCOUNT_CONGLOMERATE);
    if (discount !== undefined && delta < 0) {
      player.addResourceTo(discount, {qty: 1, log: true});
    }

    // Grothe Industries: remember productions raised during the first action of a turn.
    const grothe = player.tableau.get(CardName.GROTHE_INDUSTRIES);
    if (grothe !== undefined && delta > 0 && game.phase === Phase.ACTION && player.actionsTakenThisRound === 0) {
      const data = dataOf<{action?: number, raised?: Array<Resource>}>(grothe);
      if (data.action !== player.actionsTakenThisGame) {
        data.action = player.actionsTakenThisGame;
        data.raised = [];
      }
      data.raised = data.raised ?? [];
      if (!data.raised.includes(resource)) {
        data.raised.push(resource);
      }
    }

    // The player's own corporations.
    if (delta > 0) {
      // Ares Union: remember which productions were raised this generation.
      for (const name of [CardName.ARES_UNION]) {
        const card = player.tableau.get(name);
        if (card !== undefined) {
          const data = dataOf<RaisedData>(card);
          if (data.generation !== game.generation) {
            data.generation = game.generation;
            data.raised = [];
          }
          data.raised = data.raised ?? [];
          if (!data.raised.includes(resource)) {
            data.raised.push(resource);
          }
        }
      }
    } else {
      // Thermex: lowering your energy production may raise heat production as much.
      if (resource === Resource.ENERGY && player.tableau.has(CardName.THERMEX)) {
        player.production.add(Resource.HEAT, -delta, {log: true});
      }
      // Princess Ltd.: once per generation, lose M€ production instead.
      const princess = player.tableau.get(CardName.PRINCESS_LTD);
      if (princess !== undefined && resource !== Resource.MEGACREDITS) {
        const data = dataOf<GenerationData>(princess);
        const steps = -delta;
        if (data.generation !== game.generation && player.production.megacredits - steps >= -5) {
          player.defer(new OrOptions(
            new SelectOption(`Princess Ltd.: lose ${steps} M€ production instead of ${steps} ${resource} production`).andThen(() => {
              data.generation = game.generation;
              player.production.add(resource, steps, {log: true});
              player.production.add(Resource.MEGACREDITS, -steps, {log: true});
              return undefined;
            }),
            new SelectOption(`Keep the ${resource} production loss`).andThen(() => undefined),
          ));
        }
      }
    }

    // M.I.N.E.: anyone raising steel production may get +1 M€ production; M.I.N.E. gets +1 titanium production.
    if (resource === Resource.STEEL && delta > 0) {
      for (const p of game.players) {
        if (p.tableau.has(CardName.MINE_EPIC)) {
          p.defer(new OrOptions(
            new SelectOption(`M.I.N.E.: give ${player.name} +1 M€ production and gain +1 titanium production`, 'Do it').andThen(() => {
              player.production.add(Resource.MEGACREDITS, 1, {log: true});
              p.production.add(Resource.TITANIUM, 1, {log: true});
              return undefined;
            }),
            new SelectOption('M.I.N.E.: do nothing', 'Skip').andThen(() => undefined),
          ));
        }
      }
    }

    // Other players' corporations.
    for (const p of game.players) {
      if (p.id === player.id) {
        continue;
      }
      // Acquire Unlimited: another player gains 2+ production at once during the action phase.
      if (delta >= 2 && game.phase === Phase.ACTION && p.tableau.has(CardName.ACQUIRE_UNLIMITED)) {
        p.production.add(resource, 1, {log: true});
      }
      // Opportunistic Consortium: another player's production decreases.
      if (delta < 0 && p.tableau.has(CardName.OPPORTUNISTIC_CONSORTIUM)) {
        p.stock.add(resource, -delta, {log: true});
      }
    }

    if (delta < 0 && fromOtherPlayer) {
      EpicHooks.onReducedByAnotherPlayer(player, resource, /* production */ true);
      // Bentenmaru: the attack raises its production instead.
      if (player.tableau.has(CardName.BENTENMARU)) {
        player.production.add(resource, -2 * delta, {log: true});
      }
    }

    // Schlockmeister: raising a non-M€ production may also raise M€ production, for a deficit.
    const schlock = player.tableau.get(CardName.SCHLOCKMEISTER);
    if (schlock !== undefined && delta > 0 && resource !== Resource.MEGACREDITS) {
      player.defer(new OrOptions(
        new SelectOption('Schlockmeister: also raise your M€ production 1 step (add 1 deficit)', 'Raise').andThen(() => {
          player.production.add(Resource.MEGACREDITS, 1, {log: true});
          player.addResourceTo(schlock, {qty: 1, log: true});
          return undefined;
        }),
        new SelectOption('Schlockmeister: no', 'Skip').andThen(() => undefined),
      ));
    }
  }

  /** Called after a player's stock changed by `delta` (negative is a loss). */
  public static onStockChange(player: IPlayer, resource: Resource, delta: number, from?: From): void {
    if (delta === 0) {
      return;
    }
    const game = player.game;
    if (game === undefined) {
      return;
    }
    // Marsanto: gaining plants also gains that many M€.
    if (resource === Resource.PLANTS && delta > 0 && player.tableau.has(CardName.MARSANTO)) {
      player.stock.add(Resource.MEGACREDITS, delta, {log: true});
    }
    if (delta >= 2 && game.phase === Phase.ACTION) {
      for (const p of game.players) {
        if (p.id !== player.id && p.tableau.has(CardName.ACQUIRE_UNLIMITED)) {
          p.stock.add(resource, 1, {log: true});
        }
      }
    }
    if (delta < 0 && isFromPlayer(from) && from.player.id !== player.id) {
      EpicHooks.onReducedByAnotherPlayer(player, resource, /* production */ false);
      // Bentenmaru: the attack raises its resources instead.
      if (player.tableau.has(CardName.BENTENMARU)) {
        player.stock.add(resource, -2 * delta, {log: true});
      }
      // Corellian Engineering: a fighter can cancel the loss.
      EpicHooks.offerCorellianShield(player, `${-delta} ${resource}`, () => player.stock.add(resource, -delta, {log: true}));
      // Amityville: removing plants from others lets it gain them, or add radiation.
      const thief = from.player;
      if (resource === Resource.PLANTS && thief.tableau.has(CardName.AMITYVILLE)) {
        const amount = -delta;
        const options = [new SelectOption(`Amityville: gain ${amount} plants`, 'Gain').andThen(() => {
          thief.stock.add(Resource.PLANTS, amount, {log: true});
          return undefined;
        })];
        if (thief.getResourceCards(CardResource.RADIATION).length > 0) {
          options.push(new SelectOption(`Amityville: add ${amount} radiation to a card`, 'Add').andThen(() => {
            thief.game.defer(new AddResourcesToCard(thief, CardResource.RADIATION, {count: amount}));
            return undefined;
          }));
        }
        thief.defer(new OrOptions(...options, new SelectOption('Amityville: nothing', 'Skip').andThen(() => undefined)));
      }
    }
    // Aerospace Alloys: titanium gained goes on the card until it holds 10.
    if (resource === Resource.TITANIUM && delta > 0) {
      EpicHooks.storeAerospaceTitanium(player, delta);
    }
  }

  /**
   * Aerospace Alloys: move newly gained titanium onto the card. Titanium there can't be spent. When the card
   * holds 10, all 10 go to the player's stock and the card starts filling up again.
   */
  public static storeAerospaceTitanium(player: IPlayer, amount: number): void {
    const card = player.tableau.get(CardName.AEROSPACE_ALLOYS);
    if (card === undefined || amount <= 0) {
      return;
    }
    // The titanium being stored is the newest titanium, so it never exceeds what's in stock.
    let left = Math.min(amount, player.titanium);
    while (left > 0) {
      const moved = Math.min(left, 10 - card.resourceCount);
      left -= moved;
      player.titanium -= moved;
      card.resourceCount += moved;
      player.game.log('${0} stored ${1} titanium on ${2}', (b) => b.player(player).number(moved).card(card));
      if (card.resourceCount >= 10) {
        const released = card.resourceCount;
        player.titanium += released;
        card.resourceCount = 0;
        player.game.log('${0} moved the ${1} titanium from ${2} to their stock', (b) => b.player(player).number(released).card(card));
        // The 10 released titanium mustn't be stored again: they're already counted in `amount`.
      }
    }
  }

  /** Called when resources were removed from a card. */
  public static onCardResourceRemoved(owner: IPlayer, card: ICard, removingPlayer?: IPlayer, count: number = 1): void {
    const type = card.resourceType;
    if (type === undefined || removingPlayer === undefined || removingPlayer.id === owner.id) {
      return;
    }
    // Bentenmaru: the attack adds to the card instead.
    if (owner.tableau.has(CardName.BENTENMARU)) {
      owner.addResourceTo(card, {qty: 2 * count, log: true});
    }
    // Corellian Engineering: a fighter can cancel the loss.
    EpicHooks.offerCorellianShield(owner, `${count} ${type.toLowerCase()} on ${card.name}`, () => owner.addResourceTo(card, {qty: count, log: true}));
    for (const p of owner.game.players) {
      // Ares Security: 1 of that resource. Orbital Eye: 3 of it.
      const qty = (p.tableau.has(CardName.ARES_SECURITY) ? 1 : 0) + (p.tableau.has(CardName.ORBITAL_EYE) ? 3 : 0);
      if (qty > 0 && p.getResourceCards(type).length > 0) {
        p.game.defer(new AddResourcesToCard(p, type as CardResource, {count: qty}));
      }
    }
  }

  /** Ares Security and Orbital Eye: a player's resources or production were reduced by another player. */
  private static onReducedByAnotherPlayer(victim: IPlayer, resource: Resource, production: boolean): void {
    for (const p of victim.game.players) {
      if (p.tableau.has(CardName.ARES_SECURITY)) {
        if (production) {
          p.production.add(resource, 1, {log: true});
        } else {
          p.stock.add(resource, 1, {log: true});
        }
      }
      if (p.tableau.has(CardName.ORBITAL_EYE)) {
        p.stock.add(resource, 3, {log: true});
      }
    }
  }

  /**
   * Card cost changes caused by OTHER players' Epic corporations (a corporation's effect on its own
   * owner is in that corporation's getCardDiscount).
   */
  public static cardCostAdjustment(player: IPlayer, card: IProjectCard): number {
    let adjustment = 0;
    const game = player.game;
    for (const p of game.players) {
      if (p.id === player.id) {
        continue;
      }
      // NOJO: opponents pay 2 M€ more per Jovian tag (NOJO gets it when the card is played).
      if (p.tableau.has(CardName.NOJO)) {
        adjustment += 2 * card.tags.filter((t) => t === Tag.JOVIAN).length;
      }
      // True Mars Foundation: the marked set is 1 M€ cheaper for everyone else.
      const tmf = p.tableau.get(CardName.TRUE_MARS_FOUNDATION);
      if (tmf !== undefined) {
        const data = dataOf<TmfData>(tmf);
        if (data.generation === game.generation && data.set !== undefined) {
          const set = TRUE_MARS_FOUNDATION_SETS[data.set] ?? [];
          if (card.tags.some((t) => set.includes(t))) {
            adjustment -= 1;
          }
        }
      }
    }
    return adjustment;
  }

  /** True when an Epic corporation forbids this player from playing the card. */
  public static cannotPlay(player: IPlayer, card: IProjectCard): boolean {
    // Twin Cities of Helium: you may not play Earth tags.
    return player.tableau.has(CardName.TWIN_CITIES_OF_HELIUM) && card.tags.includes(Tag.EARTH);
  }

  /** Called after any player paid for a colony trade (Chaang Fuels Inc.). */
  public static onTradePayment(trader: IPlayer, resource: Resource, amount: number): void {
    const half = Math.floor(amount / 2);
    if (half <= 0) {
      return;
    }
    for (const p of trader.game.players) {
      if (p.id !== trader.id && p.tableau.has(CardName.CHAANG_FUELS_INC)) {
        p.stock.add(resource, half, {log: true});
      }
    }
  }

  /** Called when any player trades with a colony, before the track goes back down. */
  public static onTrade(trader: IPlayer, colony: IColony): void {
    for (const p of trader.game.players) {
      // Solar Enterprises: 1 M€ for any trade, plus 1 M€ per empty space below the marker for your own.
      if (p.tableau.has(CardName.SOLAR_ENTERPRISES)) {
        let gain = 1;
        if (p.id === trader.id) {
          gain += Math.max(0, colony.trackPosition - colony.colonies.length);
        }
        p.stock.add(Resource.MEGACREDITS, gain, {log: true});
      }
      // Ether Enterprise: 1 unit of the trade income resource for any trade.
      if (p.tableau.has(CardName.ETHER_ENTERPRISE)) {
        EpicHooks.gainOneTradeIncome(p, colony);
      }
    }
  }

  private static gainOneTradeIncome(player: IPlayer, colony: IColony): void {
    const trade = colony.metadata.trade;
    const resource = Array.isArray(trade.resource) ? trade.resource[colony.trackPosition] : trade.resource;
    switch (trade.type) {
    case ColonyBenefit.GAIN_RESOURCES:
      if (resource !== undefined) {
        player.stock.add(resource, 1, {log: true});
        return;
      }
      break;
    case ColonyBenefit.GAIN_PRODUCTION:
      if (resource !== undefined) {
        player.stock.add(resource, 1, {log: true});
        return;
      }
      break;
    case ColonyBenefit.DRAW_CARDS:
    case ColonyBenefit.DRAW_CARDS_AND_BUY_ONE:
    case ColonyBenefit.DRAW_CARDS_AND_DISCARD_ONE:
    case ColonyBenefit.DRAW_CARDS_AND_KEEP_ONE:
      player.drawCard();
      return;
    case ColonyBenefit.ADD_RESOURCES_TO_CARD:
    case ColonyBenefit.ADD_RESOURCES_TO_VENUS_CARD:
      if (colony.metadata.cardResource !== undefined && player.getResourceCards(colony.metadata.cardResource).length > 0) {
        player.game.defer(new AddResourcesToCard(player, colony.metadata.cardResource, {count: 1}));
        return;
      }
      break;
    }
    // Anything else (TR, ocean, Venus...) has no single "unit" to copy: 1 M€ instead.
    player.stock.add(Resource.MEGACREDITS, 1, {log: true});
  }

  /** Coeurl Industries: while its action is being used, steel and titanium pay for standard projects. */
  public static standardProjectPayWith(player: IPlayer, project: IStandardProjectCard, base: StandardProjectCanPayWith): StandardProjectCanPayWith {
    // S2A Modular: titanium and energy pay for the city standard project.
    if (project.name === CardName.CITY_STANDARD_PROJECT && player.tableau.has(CardName.S2A_MODULAR)) {
      base = {...base, titanium: true, energy: true, energyValue: player.energyValue};
    }
    // Bolson Construction: steel pays for the city standard project.
    if (project.name === CardName.CITY_STANDARD_PROJECT && player.tableau.has(CardName.BOLSON_CONSTRUCTION)) {
      base = {...base, steel: true};
    }
    if (project.name !== CardName.SELL_PATENTS_STANDARD_PROJECT) {
      // Microfac: microbes on it pay 3 M€ each for standard projects.
      const epic = EpicHooks.epicPayment(player, project);
      if (epic !== undefined) {
        base = {...base, epicResources: true, epicValue: epic.value};
      }
      // Milky Skyway: energy pays 2 M€ each for the city standard project.
      const energyValue = EpicHooks.energyValueFor(player, project);
      if (energyValue !== undefined) {
        base = {...base, energy: true, energyValue};
      }
    }
    const coeurl = player.tableau.get(CardName.COEURL_INDUSTRIES);
    if (coeurl === undefined || project.name === CardName.SELL_PATENTS_STANDARD_PROJECT) {
      return base;
    }
    if (dataOf<{acting?: boolean}>(coeurl).acting !== true) {
      return base;
    }
    return {...base, steel: true, titanium: true};
  }

  /**
   * Epic corporations whose own resources pay for some cards (the `epicResources` payment unit): the corporation
   * holding them and what each is worth for `card`, or undefined when none can pay for it.
   */
  public static epicPayment(player: IPlayer, card: ICard): {source: ICard, value: number} | undefined {
    for (const name of EPIC_PAYMENT_CORPS) {
      const source = player.tableau.get(name);
      if (source === undefined || source.resourceCount === 0) {
        continue;
      }
      const value = EpicHooks.epicPaymentValue(player, name, card);
      if (value !== undefined) {
        return {source, value};
      }
    }
    return undefined;
  }

  /** The corporation whose resources the `epicResources` payment unit spends. */
  public static epicPaymentSource(player: IPlayer): ICard | undefined {
    for (const name of EPIC_PAYMENT_CORPS) {
      const source = player.tableau.get(name);
      if (source !== undefined && source.resourceCount > 0) {
        return source;
      }
    }
    return undefined;
  }

  /** The kind of resource the player's paying corporation holds (for the payment icon). */
  public static epicPaymentResource(player: IPlayer): CardResource | undefined {
    for (const name of EPIC_PAYMENT_CORPS) {
      const source = player.tableau.get(name);
      if (source !== undefined) {
        return source.resourceType;
      }
    }
    return undefined;
  }

  private static epicPaymentValue(player: IPlayer, corp: CardName, card: ICard): number | undefined {
    const has = (tag: Tag) => card.tags.includes(tag);
    switch (corp) {
    case CardName.PEGASUS_GROUP:
      return has(Tag.SPACE) || has(Tag.SCIENCE) ? 2 : undefined;
    case CardName.OMNIDRONE_LABS:
      return has(Tag.SCIENCE) ? 2 : undefined;
    case CardName.STELLAR_ROBOTICS:
      return card.type === CardType.AUTOMATED ? 5 : undefined;
    case CardName.TECHNONAUTS:
      return card.type === CardType.ACTIVE ? 6 : undefined;
    case CardName.XANTHUM:
      // Worth 5, plus whatever raises the value of steel and titanium.
      return has(Tag.SPACE) || has(Tag.BUILDING) ? 5 + (player.getSteelValue() - 2) + (player.getTitaniumValue() - 3) : undefined;
    case CardName.OCEANUS:
      return has(Tag.JOVIAN) ? 3 : undefined;
    case CardName.SAGA_BIOENGINEERING:
      return has(Tag.ANIMAL) ? 3 : undefined;
    case CardName.MICROFAC:
      return card.type === CardType.STANDARD_PROJECT ? 3 : undefined;
    case CardName.TRON:
      return 2;
    case CardName.UN_VENUS_INITIATIVE:
      return EpicHooks.raisesVenus(card) ? 1 : undefined;
    default:
      return undefined;
    }
  }

  /** OmniDrone Labs: plants pay 2 M€ each for cards with a science tag. */
  public static plantsValueFor(player: IPlayer, card: ICard): number | undefined {
    return player.tableau.has(CardName.OMNIDRONE_LABS) && card.tags.includes(Tag.SCIENCE) ? 2 : undefined;
  }

  /** Milky Skyway: energy pays 2 M€ each for cards with a city tag and the city standard project. */
  public static energyValueFor(player: IPlayer, card: ICard): number | undefined {
    if (!player.tableau.has(CardName.MILKY_SKYWAY)) {
      return undefined;
    }
    if (card.tags.includes(Tag.CITY) || card.name === CardName.CITY_STANDARD_PROJECT) {
      return Math.max(2, player.energyValue);
    }
    return undefined;
  }

  /** A free conversion: pick how many (1 to max), then convert. */
  private static conversion(player: IPlayer, title: string, max: number, convert: (x: number) => void): SelectOption {
    return new SelectOption(title, 'Convert').andThen(() =>
      new SelectAmount('How many?', 'Convert', 1, max, true).andThen((x) => {
        player.freeActionTaken = true;
        convert(x);
        return undefined;
      }));
  }

  /** Atlantis and Bolson Construction: their cities may go on ocean tiles. */
  public static citiesOnOceans(player: IPlayer): boolean {
    return player.tableau?.has(CardName.ATLANTIS) === true || player.tableau?.has(CardName.BOLSON_CONSTRUCTION) === true;
  }

  /** Babylonia: its greeneries may go on ocean tiles. */
  public static greeneriesOnOceans(player: IPlayer): boolean {
    return player.tableau?.has(CardName.BABYLONIA) === true;
  }

  /** Plain, unclaimed ocean tiles that a city or greenery could go on top of. */
  public static plainOceans(spaces: ReadonlyArray<Space>): Array<Space> {
    return spaces.filter((space) => space.tile?.tileType === TileType.OCEAN && space.player === undefined && space.cube === undefined);
  }

  /**
   * A city or greenery placed on an ocean tile becomes a city on an ocean (Atlantis, Bolson Construction) or a
   * greenery on an ocean (Babylonia): it counts as both, and covers the ocean.
   */
  public static convertTile(player: IPlayer, space: Space, tile: Tile): Tile {
    if (space.tile?.tileType !== TileType.OCEAN) {
      return tile;
    }
    if (tile.tileType === TileType.CITY && EpicHooks.citiesOnOceans(player)) {
      return {...tile, tileType: TileType.OCEAN_CITY, covers: space.tile};
    }
    if (tile.tileType === TileType.GREENERY && EpicHooks.greeneriesOnOceans(player)) {
      return {...tile, tileType: TileType.OCEAN_GREENERY, covers: space.tile};
    }
    return tile;
  }

  /** Mega ThermoElectric and MeissnerVolt: energy does not turn into heat in the production phase. */
  public static keepsEnergy(player: IPlayer): boolean {
    return player.tableau.has(CardName.MEGA_THERMOELECTRIC) || player.tableau.has(CardName.MEISSNERVOLT);
  }

  /** Called after energy became heat and before resources are produced. */
  public static beforeProduction(player: IPlayer): void {
    // ECME: lose every base resource except M€; +1 temperature per 8 heat lost.
    if (!player.tableau.has(CardName.ECME_CORPORATION)) {
      return;
    }
    const heat = player.heat;
    const lost = player.steel + player.titanium + player.plants + player.energy + heat;
    player.steel = 0;
    player.titanium = 0;
    player.plants = 0;
    player.energy = 0;
    player.heat = 0;
    if (lost > 0) {
      player.game.log('${0} removed ${1} base resources (ECME)', (b) => b.player(player).number(lost));
    }
    let steps = Math.floor(heat / 8);
    while (steps > 0 && player.game.getTemperature() < 8) {
      player.game.increaseTemperature(player, 1);
      steps--;
    }
  }

  /** Called when a player claims a milestone or funds an award. */
  public static onMilestoneOrAward(player: IPlayer): void {
    for (const p of player.game.players) {
      const landmark = p.tableau.get(CardName.LANDMARK_ACHIEVEMENTS);
      if (landmark === undefined) {
        continue;
      }
      if (p.id !== player.id) {
        p.drawCard(2);
      } else {
        const data = dataOf<{free?: boolean}>(landmark);
        if (data.free === true) {
          data.free = false; // Its own free award isn't bought.
        } else {
          p.increaseTerraformRating(1, {log: true});
        }
      }
    }
  }

  /** ROD Association: selling patents gives resources for their tags. */
  public static onPatentsSold(player: IPlayer, cards: ReadonlyArray<IProjectCard>): void {
    // Scavenger sells patents for 2 M€ each (1 more than usual).
    if (player.tableau.has(CardName.SCAVENGER) && cards.length > 0) {
      player.stock.add(Resource.MEGACREDITS, cards.length, {log: true});
    }
    EpicHooks.onCardsDiscarded(player, cards);
    if (player.tableau.has(CardName.ROD_ASSOCIATION) && cards.length > 0) {
      EpicUtils.rodGain(player, cards);
    }
  }

  /** Cryo (temperature) and Lorean (any): ignore maximum global requirements. */
  public static ignoresMaxRequirement(player: IPlayer, parameter: GlobalParameter): boolean {
    if (player.tableau.has(CardName.LOREAN)) {
      return true;
    }
    return parameter === GlobalParameter.TEMPERATURE && player.tableau.has(CardName.CRYO);
  }

  /** Free conversions that don't use an action (Nitrogen'r'us, Prefab-U-Haus). */
  public static freeActionOption(player: IPlayer): PlayerInput | undefined {
    const options: Array<SelectOption> = [];
    if (player.tableau.has(CardName.NITROGEN_R_US) && player.titanium >= 3 && player.canAfford({cost: 0, tr: {tr: 1}})) {
      const max = Math.floor(player.titanium / 3);
      const run = (times: number) => {
        player.freeActionTaken = true;
        player.stock.deduct(Resource.TITANIUM, 3 * times, {log: true});
        player.increaseTerraformRating(times, {log: true});
        return undefined;
      };
      options.push(new SelectOption('Nitrogen\'r\'us: 3 titanium → +1 TR', 'Convert').andThen(() =>
        max === 1 ? run(1) : new SelectAmount('How many times?', 'Convert', 1, max, false).andThen(run)));
    }
    if (player.tableau.has(CardName.PREFAB_U_HAUS) && player.steel >= 8 && player.game.board.getAvailableSpacesForCity(player).length > 0) {
      options.push(new SelectOption('Prefab-U-Haus: 8 steel → place a city', 'Build').andThen(() => {
        player.freeActionTaken = true;
        player.stock.deduct(Resource.STEEL, 8, {log: true});
        player.game.defer(new PlaceCityTile(player));
        return undefined;
      }));
    }
    const elm = player.tableau.get(CardName.ELM);
    if (elm !== undefined && elm.resourceCount > 0) {
      options.push(new SelectOption('ELM: spend influence for 2 M€ each', 'Spend').andThen(() =>
        new SelectAmount('How much influence?', 'Spend', 1, elm.resourceCount, true).andThen((x) => {
          player.freeActionTaken = true;
          player.removeResourceFrom(elm, x, {log: true});
          player.stock.add(Resource.MEGACREDITS, 2 * x, {log: true});
          return undefined;
        })));
    }
    // General Alliance: look at the preludes waiting on the card.
    const alliance = player.tableau.get(CardName.GENERAL_ALLIANCE);
    if (alliance !== undefined && dataOf<{preludes?: Array<CardName>}>(alliance).preludes?.length) {
      const preludes = (alliance as unknown as {preludes(): Array<IProjectCard>}).preludes();
      options.push(new SelectOption('General Alliance: look at your preludes', 'Look').andThen(() =>
        new SelectCard('Preludes on General Alliance', 'OK', preludes, {min: 0, max: 0}).andThen(() => {
          player.freeActionTaken = true;
          return undefined;
        })));
    }
    // Cloud Computing: look at next generation's research cards.
    const cloud = player.tableau.get(CardName.CLOUD_COMPUTING);
    if (cloud !== undefined && dataOf<{next?: Array<CardName>}>(cloud).next?.length) {
      const next = (cloud as unknown as {nextCards(): Array<IProjectCard>}).nextCards();
      options.push(new SelectOption('Cloud Computing: look at next generation\'s research cards', 'Look').andThen(() =>
        new SelectCard('Next generation\'s research cards (kept aside)', 'OK', next, {min: 0, max: 0}).andThen(() => {
          player.freeActionTaken = true;
          return undefined;
        })));
    }
    // Arboralists: plants as M€ (not the other way round).
    if (player.tableau.has(CardName.ARBORALISTS) && player.plants > 0) {
      options.push(EpicHooks.conversion(player, 'Arboralists: use plants as M€', player.plants, (x) => {
        player.stock.deduct(Resource.PLANTS, x, {log: true});
        player.stock.add(Resource.MEGACREDITS, x, {log: true});
      }));
    }
    // Evergreen Energy: plants as energy (not the other way round).
    if (player.tableau.has(CardName.EVERGREEN_ENERGY) && player.plants > 0) {
      options.push(EpicHooks.conversion(player, 'Evergreen Energy: use plants as energy', player.plants, (x) => {
        player.stock.deduct(Resource.PLANTS, x, {log: true});
        player.stock.add(Resource.ENERGY, x, {log: true});
      }));
    }
    // Infinity Energy: heat as energy, and energy as heat.
    if (player.tableau.has(CardName.INFINITY_ENERGY)) {
      if (player.heat > 0) {
        options.push(EpicHooks.conversion(player, 'Infinity Energy: use heat as energy', player.heat, (x) => {
          player.stock.deduct(Resource.HEAT, x, {log: true});
          player.stock.add(Resource.ENERGY, x, {log: true});
        }));
      }
      if (player.energy > 0) {
        options.push(EpicHooks.conversion(player, 'Infinity Energy: use energy as heat', player.energy, (x) => {
          player.stock.deduct(Resource.ENERGY, x, {log: true});
          player.stock.add(Resource.HEAT, x, {log: true});
        }));
      }
    }
    // Amazonis: any player may buy basic resources for 3 M€ each; Amazonis gets 2 M€ per resource an opponent buys.
    const amazonis = player.game.players.find((p) => p.tableau.has(CardName.AMAZONIS));
    if (amazonis !== undefined && player.canAfford(3)) {
      let max = 1;
      while (player.canAfford(3 * (max + 1))) {
        max++;
      }
      const buy = (n: number) => new SelectResources(message('Buy ${0} basic resources (3 M€ each, not M€)', (b) => b.number(n)), n, 'Buy').andThen((units) => {
        if (units.megacredits > 0) {
          throw new InputError('Choose basic resources other than M€');
        }
        player.freeActionTaken = true;
        player.game.defer(new SelectPaymentDeferred(player, 3 * n, {title: 'Amazonis: pay for the resources'}).andThen(() => {
          player.stock.adjust(units, {log: true});
          if (amazonis !== player) {
            amazonis.stock.add(Resource.MEGACREDITS, 2 * n, {log: true, from: {card: CardName.AMAZONIS}});
          }
        }));
        return undefined;
      });
      options.push(new SelectOption('Amazonis: buy basic resources for 3 M€ each', 'Buy').andThen(() =>
        max === 1 ? buy(1) : new SelectAmount('How many resources?', 'Buy', 1, max, true).andThen(buy)));
    }
    // TRON: administration resources stand in for missing plants when converting plants into a greenery.
    const tron = player.tableau.get(CardName.TRON);
    if (tron !== undefined && tron.resourceCount > 0) {
      const needed = player.plantsNeededForGreenery + EpicHooks.extraPlantsForGreenery(player) - player.plants;
      if (needed > 0 && needed <= tron.resourceCount) {
        options.push(new SelectOption(`TRON: use ${needed} administration resources as plants for a greenery`, 'Use').andThen(() => {
          player.freeActionTaken = true;
          player.removeResourceFrom(tron, needed, {log: true});
          player.stock.add(Resource.PLANTS, needed, {log: true});
          return undefined;
        }));
      }
    }
    // ARC: spend animals here as 1 M€ per populated greenery, or 1 plant per 2 populated oceans.
    const arc = player.tableau.get(CardName.ARC);
    if (arc !== undefined && arc.resourceCount > 0) {
      const {greeneries, oceans} = (arc as unknown as {populated(p: IPlayer): {greeneries: number, oceans: number}}).populated(player);
      if (greeneries > 0) {
        options.push(EpicHooks.conversion(player, `ARC: spend animals for ${greeneries} M€ each`, arc.resourceCount, (x) => {
          player.removeResourceFrom(arc, x, {log: true});
          player.stock.add(Resource.MEGACREDITS, x * greeneries, {log: true});
        }));
      }
      if (oceans >= 2) {
        const plants = Math.floor(oceans / 2);
        options.push(EpicHooks.conversion(player, `ARC: spend animals for ${plants} plant(s) each`, arc.resourceCount, (x) => {
          player.removeResourceFrom(arc, x, {log: true});
          player.stock.add(Resource.PLANTS, x * plants, {log: true});
        }));
      }
    }
    // Cold Fusion: sell energy for 1 M€ each.
    if (player.tableau.has(CardName.COLD_FUSION) && player.energy > 0) {
      options.push(EpicHooks.conversion(player, 'Cold Fusion: sell energy for 1 M€ each', player.energy, (x) => {
        player.stock.deduct(Resource.ENERGY, x, {log: true});
        player.stock.add(Resource.MEGACREDITS, x, {log: true});
      }));
    }
    // Le Martian: plants as 2 M€ and animals from your cards as 3 M€.
    if (player.tableau.has(CardName.LE_MARTIAN)) {
      if (player.plants > 0) {
        options.push(new SelectOption('Le Martian: use plants as 2 M€ each', 'Convert').andThen(() =>
          new SelectAmount('How many plants?', 'Convert', 1, player.plants, true).andThen((x) => {
            player.freeActionTaken = true;
            player.stock.deduct(Resource.PLANTS, x, {log: true});
            player.stock.add(Resource.MEGACREDITS, 2 * x, {log: true});
            return undefined;
          })));
      }
      const animalCards = player.getCardsWithResources(CardResource.ANIMAL);
      if (animalCards.length > 0) {
        options.push(new SelectOption('Le Martian: use animals from your cards as 3 M€ each', 'Convert').andThen(() =>
          new SelectCard('Take animals from', 'Select', animalCards).andThen(([card]) =>
            new SelectAmount('How many animals?', 'Convert', 1, card.resourceCount, true).andThen((x) => {
              player.freeActionTaken = true;
              player.removeResourceFrom(card, x, {log: true});
              player.stock.add(Resource.MEGACREDITS, 3 * x, {log: true});
              return undefined;
            }))));
      }
    }
    const microbes = player.getResourceCount(CardResource.MICROBE);
    if (player.tableau.has(CardName.HEINDL_AQUATIC) && microbes > 0) {
      options.push(new SelectOption('HeindlAquatic: use microbes as plants', 'Convert').andThen(() =>
        new SelectCard('Take microbes from', 'Select', player.getCardsWithResources(CardResource.MICROBE)).andThen(([card]) =>
          new SelectAmount('How many microbes?', 'Convert', 1, card.resourceCount, true).andThen((x) => {
            player.freeActionTaken = true;
            player.removeResourceFrom(card, x, {log: true});
            player.stock.add(Resource.PLANTS, x, {log: true});
            return undefined;
          }))));
    }
    if (player.tableau.has(CardName.BIOFUSION) && player.getResourceCount(CardResource.RADIATION) > 0 && player.getResourceCards(CardResource.MICROBE).length > 0) {
      options.push(new SelectOption('Biofusion: use radiation as microbes', 'Move').andThen(() =>
        new SelectCard('Take radiation from', 'Select', player.getCardsWithResources(CardResource.RADIATION)).andThen(([from]) =>
          new SelectCard('Put microbes on', 'Select', player.getResourceCards(CardResource.MICROBE)).andThen(([to]) =>
            new SelectAmount('How many?', 'Move', 1, from.resourceCount, true).andThen((n) => {
              player.freeActionTaken = true;
              player.removeResourceFrom(from, n, {log: true});
              player.addResourceTo(to, {qty: n, log: true});
              return undefined;
            })))));
    }
    const gaia = player.tableau.get(CardName.G_AI_A);
    if (gaia !== undefined && gaia.resourceCount > 0) {
      const exchange = (label: string, rate: number, give: (n: number) => void) => new SelectOption(`G-AI-A: ${label}`, 'Exchange').andThen(() =>
        new SelectAmount('How many?', 'Exchange', 1, Math.floor(gaia.resourceCount / rate), true).andThen((n) => {
          player.freeActionTaken = true;
          player.removeResourceFrom(gaia, n * rate, {log: true});
          give(n);
          return undefined;
        }));
      if (player.getResourceCards(CardResource.MICROBE).length > 0) {
        options.push(exchange('1 science → 1 microbe', 1, (n) => player.game.defer(new AddResourcesToCard(player, CardResource.MICROBE, {count: n}))));
      }
      if (gaia.resourceCount >= 2) {
        options.push(exchange('2 science → 1 plant', 2, (n) => player.stock.add(Resource.PLANTS, n, {log: true})));
      }
      if (gaia.resourceCount >= 3 && player.getResourceCards(CardResource.ANIMAL).length > 0) {
        options.push(exchange('3 science → 1 animal', 3, (n) => player.game.defer(new AddResourcesToCard(player, CardResource.ANIMAL, {count: n}))));
      }
    }
    // Wild resources (Discount Conglomerate, Flexi-Change, ...) and Exotica's goods: use as any standard resource.
    for (const card of player.tableau) {
      if ((card.resourceType !== CardResource.WILD_RESOURCE && card.resourceType !== CardResource.GOODS) || card.resourceCount === 0) {
        continue;
      }
      const noun = card.resourceType === CardResource.GOODS ? 'goods' : 'wild resources';
      const take = (n: number) => new SelectResources(message('Gain ${0} standard resources', (b) => b.number(n)), n).andThen((units) => {
        player.freeActionTaken = true;
        player.removeResourceFrom(card, n, {log: true});
        player.stock.adjust(units, {log: true});
        return undefined;
      });
      options.push(new SelectOption(`${card.name}: use ${noun} as standard resources`, 'Convert').andThen(() =>
        card.resourceCount === 1 ? take(1) : new SelectAmount(`How many ${noun}?`, 'Convert', 1, card.resourceCount, true).andThen(take)));
    }
    if (options.length === 0) {
      return undefined;
    }
    return new OrOptions(...options).setTitle('Free conversions (Epic corporations)');
  }

  /** Planet Forge (Venus cards) and Plutonic Prototyping (space cards) may pay with steel. */
  public static canUseSteel(player: IPlayer, card: IProjectCard): boolean {
    return (player.tableau.has(CardName.PLANET_FORGE) && card.tags.includes(Tag.VENUS)) ||
      (player.tableau.has(CardName.PLUTONIC_PROTOTYPING) && card.tags.includes(Tag.SPACE)) ||
      (player.tableau.has(CardName.VANGUARD) && card.tags.includes(Tag.VENUS));
  }

  /** Planet Forge (Venus cards) and Plutonic Prototyping (building cards) may pay with titanium. */
  public static canUseTitanium(player: IPlayer, card: IProjectCard): boolean {
    return (player.tableau.has(CardName.PLANET_FORGE) && card.tags.includes(Tag.VENUS)) ||
      (player.tableau.has(CardName.PLUTONIC_PROTOTYPING) && card.tags.includes(Tag.BUILDING));
  }

  /** Steel's value for `card` when it differs from the usual. Undefined means the usual value. */
  public static steelValueForCard(_player: IPlayer, _card: IProjectCard): number | undefined {
    return undefined;
  }

  /** New Grounds places cities ignoring the normal rules. */
  public static ignoresCityPlacement(player: IPlayer): boolean {
    return player.tableau.has(CardName.NEW_GROUNDS) ||
      // Cosmos Casinos: cities may go next to other cities.
      player.tableau.has(CardName.COSMOS_CASINOS);
  }

  /** S2A Modular: your cities may go next to your own cities, but not next to anyone else's. */
  public static citiesNextToOwnCities(player: IPlayer): boolean {
    return player.tableau.has(CardName.S2A_MODULAR);
  }

  /** Cosmos Casinos: the award it funded scores double. */
  public static awardMultiplier(game: IGame, awardName: string): number {
    for (const player of game.players) {
      const casinos = player.tableau.get(CardName.COSMOS_CASINOS);
      if (casinos !== undefined && dataOf<{award?: string}>(casinos).award === awardName) {
        return 2;
      }
    }
    return 1;
  }

  /** Mars Archives: offer to archive cards the player just discarded. */
  /** Records cards discarded during the research phase, so Scavenger is offered only those. */
  public static recordScavengerDiscards(player: IPlayer, cards: ReadonlyArray<IProjectCard>): void {
    const scavenger = player.game.players.find((p) => p.tableau.has(CardName.SCAVENGER));
    const corp = scavenger?.tableau.get(CardName.SCAVENGER);
    if (corp === undefined || cards.length === 0) {
      return;
    }
    const data = corp.data as {discards?: Array<CardName>};
    data.discards = [...(data.discards ?? []), ...cards.map((c) => c.name)];
  }

  public static onCardsDiscarded(player: IPlayer, cards: ReadonlyArray<IProjectCard>): void {
    // Scavenger may buy the cards discarded during the research phase.
    if (player.game.phase === Phase.RESEARCH) {
      EpicHooks.recordScavengerDiscards(player, cards);
    }
    const archives = player.tableau?.get(CardName.MARS_ARCHIVES);
    if (archives !== undefined && cards.length > 0) {
      (archives as unknown as {offerArchive(p: IPlayer, c: ReadonlyArray<IProjectCard>): void}).offerArchive(player, cards);
    }
  }

  /** Aquatix: oceans may go on land areas too, except next to 2 or more cities. */
  public static oceansOnLand(player: IPlayer): boolean {
    return player.tableau.has(CardName.AQUATIX);
  }

  /** Aquarin Ent.: may keep placing oceans after the ocean maximum is reached (no TR for those). */
  public static oceansPastMax(player: IPlayer): boolean {
    return player.tableau.has(CardName.AQUARIN_ENT);
  }

  /** New Grounds places greeneries ignoring the normal rules. */
  public static ignoresGreeneryPlacement(player: IPlayer): boolean {
    return player.tableau.has(CardName.NEW_GROUNDS);
  }

  /** Space Guild: its events stay face up, so their tags count. */
  public static eventsFaceUp(player: IPlayer): boolean {
    return player.tableau.has(CardName.SPACE_GUILD);
  }

  /** What `player` pays to buy `card` (research, setup, card-buying actions). NOJO buys Jovian cards for free. */
  public static cardBuyCost(player: IPlayer, card: IProjectCard): number {
    if (player.tableau.has(CardName.NOJO) && card.tags.includes(Tag.JOVIAN)) {
      return 0;
    }
    return player.cardCost;
  }

  /** The total cost of buying `cards`, with the `freeCount` most expensive of them free. */
  public static cardBuyTotal(player: IPlayer, cards: ReadonlyArray<IProjectCard>, freeCount: number = 0): number {
    const costs = cards.map((c) => EpicHooks.cardBuyCost(player, c)).sort((a, b) => b - a);
    return costs.slice(freeCount).reduce((sum, c) => sum + c, 0);
  }

  /** First Wave: the first 4 cards kept during setup are free. */
  public static freeSetupCards(corp: ICorporationCard): number {
    // Imakita Industrial: all 10 starting cards are free.
    if (corp.name === CardName.IMAKITA_INDUSTRIAL) {
      return 10;
    }
    return corp.name === CardName.FIRST_WAVE ? 4 : 0;
  }

  /** Called at the start of each player's research phase. */
  public static onResearchPhaseStart(player: IPlayer): void {
    if (player.tableau.has(CardName.GENERAL_ALLIANCE)) {
      const alliance = player.tableau.get(CardName.GENERAL_ALLIANCE) as unknown as {data: {preludes?: Array<CardName>}};
      const drawn = player.game.preludeDeck.drawN(player.game, 2);
      alliance.data.preludes = [...(alliance.data.preludes ?? []), ...drawn.map((card) => card.name)];
      player.game.log('${0} drew ${1} prelude(s) (General Alliance)', (b) => b.player(player).number(drawn.length));
    }
  }

  /** Called when a player passes. */
  public static onPass(player: IPlayer): void {
    // Bentenmaru: discard all remaining M€.
    if (player.tableau.has(CardName.BENTENMARU) && player.megaCredits > 0) {
      player.game.log('${0} discarded ${1} M€ (Bentenmaru)', (b) => b.player(player).number(player.megaCredits));
      player.megaCredits = 0;
    }
  }

  /** Corellian Engineering: spend 1 fighter to undo a resource loss caused by another player. */
  private static offerCorellianShield(player: IPlayer, what: string, restore: () => void): void {
    const corellian = player.tableau.get(CardName.CORELLIAN_ENGINEERING);
    if (corellian === undefined || corellian.resourceCount === 0) {
      return;
    }
    player.defer(new OrOptions(
      new SelectOption(`Corellian Engineering: spend 1 fighter to keep your ${what}`, 'Spend').andThen(() => {
        player.removeResourceFrom(corellian, 1, {log: true});
        restore();
        return undefined;
      }),
      new SelectOption('Accept the loss', 'Accept').andThen(() => undefined),
    ));
  }

  /** Carbon Nanosystems (Epic): graphene pays for space and building cards. */
  public static canUseGraphene(player: IPlayer, card: IProjectCard): boolean {
    return player.tableau.has(CardName.CARBON_NANOSYSTEMS_EPIC) && (card.tags.includes(Tag.SPACE) || card.tags.includes(Tag.CITY));
  }

  /** Graphene's value when it differs from the usual 4 M€. Undefined means the usual value. */
  public static grapheneValue(_player: IPlayer): number | undefined {
    return undefined;
  }

  /** Darwin Evolution: animal tags also count as science tags. */
  public static animalsAreScience(player: IPlayer): boolean {
    return player.tableau.has(CardName.DARWIN_EVOLUTION);
  }

  /**
   * Darwin Evolution: an animal card may miss a global requirement by up to 2 steps per science resource;
   * the science needed is spent when the card is played.
   */
  public static bendGlobalRequirement(player: IPlayer, card: IProjectCard, distance: number): boolean {
    // Jump-Start Corporation: during its action, each wild resource shifts a global requirement 1 step.
    const jumpStart = player.tableau.get(CardName.JUMP_START_CORPORATION);
    if (jumpStart !== undefined && distance > 0 && distance <= jumpStart.resourceCount) {
      const data = dataOf<{pending?: boolean, spend?: Record<string, number>}>(jumpStart);
      if (data.pending === true) {
        data.spend = data.spend ?? {};
        data.spend[card.name] = Math.max(data.spend[card.name] ?? 0, distance);
        return true;
      }
    }
    const darwin = player.tableau.get(CardName.DARWIN_EVOLUTION);
    if (darwin === undefined || !card.tags.includes(Tag.ANIMAL) || distance <= 0) {
      return false;
    }
    const needed = Math.ceil(distance / 2);
    if (needed > darwin.resourceCount) {
      return false;
    }
    const data = dataOf<{spend?: Record<string, number>}>(darwin);
    data.spend = data.spend ?? {};
    data.spend[card.name] = Math.max(data.spend[card.name] ?? 0, needed);
    return true;
  }

  /**
   * Sky Ranchers (a wild tag for animal cards) and Space Penal Colonies (prisoners as wild tags)
   * for tag requirements that are `missing` tags short.
   */
  public static extraTagsForRequirement(player: IPlayer, card: IProjectCard, missing: number): boolean {
    if (missing <= 0) {
      return true;
    }
    let extra = 0;
    if (player.tableau.has(CardName.SKY_RANCHERS) && card.tags.includes(Tag.ANIMAL)) {
      extra++;
    }
    if (missing <= extra) {
      return true;
    }
    // Short-Cut Enterprise: during its action, each wild resource lowers a tag requirement by 1.
    const shortCut = player.tableau.get(CardName.SHORT_CUT_ENTERPRISE);
    if (shortCut !== undefined && missing - extra <= shortCut.resourceCount) {
      const data = dataOf<{pending?: boolean, spend?: Record<string, number>}>(shortCut);
      if (data.pending === true) {
        data.spend = data.spend ?? {};
        data.spend[card.name] = Math.max(data.spend[card.name] ?? 0, missing - extra);
        return true;
      }
    }
    const penal = player.tableau.get(CardName.SPACE_PENAL_COLONIES);
    if (penal !== undefined && missing - extra <= penal.resourceCount) {
      const data = dataOf<{spend?: Record<string, number>}>(penal);
      data.spend = data.spend ?? {};
      data.spend[card.name] = Math.max(data.spend[card.name] ?? 0, missing - extra);
      return true;
    }
    return false;
  }

  /** Xenos Zoological: after its action, the chosen non-Venus animal card ignores all requirements. */
  public static ignoresAllRequirements(player: IPlayer, card: ICard): boolean {
    const xenos = player.tableau?.get(CardName.XENOS_ZOOLOGICAL);
    if (xenos === undefined || dataOf<{pending?: boolean}>(xenos).pending !== true) {
      return false;
    }
    return card.tags.includes(Tag.ANIMAL) && !card.tags.includes(Tag.VENUS);
  }

  /** Top-Up Operation: during its action, the chosen card ignores its maximum requirements. */
  public static ignoresMaxRequirements(player: IPlayer): boolean {
    const topUp = player.tableau?.get(CardName.TOP_UP_OPERATION);
    return topUp !== undefined && dataOf<{pending?: boolean}>(topUp).pending === true;
  }

  /** Short-Cut Enterprise: during its action, tag requirements are checked one by one (wild resources fill gaps). */
  public static checksTagsSeparately(player: IPlayer): boolean {
    const shortCut = player.tableau?.get(CardName.SHORT_CUT_ENTERPRISE);
    return shortCut !== undefined && dataOf<{pending?: boolean}>(shortCut).pending === true;
  }

  /** Called just before the production phase, while players can still be asked things. */
  public static beforeProductionPhase(game: IGame): void {
    for (const p of game.players) {
      const syndicat = p.tableau.get(CardName.SYNDICAT_DES_TRAVAILLEURS_MARTIENS);
      if (syndicat === undefined) {
        continue;
      }
      const data = dataOf<{chosen?: Array<Resource>, current?: Resource}>(syndicat);
      const all = [Resource.MEGACREDITS, Resource.STEEL, Resource.TITANIUM, Resource.PLANTS, Resource.ENERGY, Resource.HEAT];
      let open = all.filter((r) => !(data.chosen ?? []).includes(r));
      if (open.length === 0) {
        data.chosen = [];
        open = all;
      }
      p.defer(new OrOptions(...open.map((r) => new SelectOption(`Other players produce 5 less ${r}`).andThen(() => {
        data.chosen = [...(data.chosen ?? []), r];
        data.current = r;
        game.log('${0} strikes: other players produce 5 less ${1} this generation', (b) => b.player(p).string(r));
        return undefined;
      }))).setTitle('Syndicat des Travailleurs Martiens: choose a resource'));
    }
  }

  /** Called right after a player received this generation's production. */
  public static afterProduction(player: IPlayer): void {
    // UN Venus Initiative: 5 M€ of Venus funds each production phase.
    const unvi = player.tableau.get(CardName.UN_VENUS_INITIATIVE);
    if (unvi !== undefined) {
      player.addResourceTo(unvi, {qty: 5, log: true});
    }
    for (const p of player.game.players) {
      if (p.id === player.id) {
        continue;
      }
      const syndicat = p.tableau.get(CardName.SYNDICAT_DES_TRAVAILLEURS_MARTIENS);
      const resource = syndicat !== undefined ? dataOf<{current?: Resource}>(syndicat).current : undefined;
      if (resource === undefined) {
        continue;
      }
      const produced = resource === Resource.MEGACREDITS ? player.production.megacredits + player.terraformRating : player.production.get(resource);
      const loss = Math.min(5, Math.max(0, produced), player.stock.get(resource));
      if (loss > 0) {
        player.stock.add(resource, -loss);
        player.game.log('${0} produced ${1} less ${2} (Syndicat des Travailleurs Martiens)', (b) => b.player(player).number(loss).string(resource));
      }
    }
  }

  /** Called at the start of each generation. */
  public static onGenerationStart(game: IGame): void {
    for (const p of game.players) {
      // Dynamic Business Services: last generation's effect ends.
      const dbs = p.tableau.get(CardName.DYNAMIC_BUSINESS_SERVICES);
      if (dbs !== undefined) {
        (dbs as unknown as {resetForNewGeneration(p: IPlayer): void}).resetForNewGeneration(p);
      }
      // Aether Vial: after production, add or discard up to 5 M€ on the card.
      const vial = p.tableau.get(CardName.AETHER_VIAL);
      if (vial !== undefined) {
        const data = dataOf<{stored?: number}>(vial);
        const stored = data.stored ?? 0;
        const options: Array<SelectOption> = [];
        if (p.megaCredits > 0) {
          options.push(new SelectOption(`Aether Vial: add up to 5 M€ (now ${stored})`, 'Add').andThen(() =>
            new SelectAmount('Add how many M€?', 'Add', 1, Math.min(5, p.megaCredits), true).andThen((n) => {
              p.stock.deduct(Resource.MEGACREDITS, n);
              data.stored = stored + n;
              game.log('${0} added ${1} M€ to Aether Vial (now ${2})', (b) => b.player(p).number(n).number(stored + n));
              return undefined;
            })));
        }
        if (stored > 0) {
          options.push(new SelectOption(`Aether Vial: discard up to 5 M€ (now ${stored})`, 'Discard').andThen(() =>
            new SelectAmount('Discard how many M€?', 'Discard', 1, Math.min(5, stored), true).andThen((n) => {
              data.stored = stored - n;
              game.log('${0} discarded ${1} M€ from Aether Vial (now ${2})', (b) => b.player(p).number(n).number(stored - n));
              return undefined;
            })));
        }
        if (options.length > 0) {
          p.defer(new OrOptions(...options, new SelectOption(`Aether Vial: leave it at ${stored} M€`, 'Keep').andThen(() => undefined)));
        }
      }
      // New Tech: its action is only available as the first action of a generation.
      const newTech = p.tableau.get(CardName.NEW_TECH);
      if (newTech !== undefined) {
        dataOf<{actionsAtStart?: number}>(newTech).actionsAtStart = p.actionsTakenThisGame;
      }
    }
  }

  /**
   * Called just before the Turmoil step, while players can still be asked things.
   * Ares Technology: reorder the top 3 global events before the distant event is revealed.
   */
  public static beforeTurmoilPhase(game: IGame): void {
    const turmoil = game.turmoil;
    if (turmoil === undefined) {
      return;
    }
    for (const p of game.players) {
      if (!p.tableau.has(CardName.ARES_TECHNOLOGY)) {
        continue;
      }
      const deck = turmoil.globalEventDealer.deck;
      const n = Math.min(3, deck.length);
      if (n < 2) {
        continue;
      }
      // The deck draws from the end, so top[0] is the next event to be revealed.
      const top: Array<IGlobalEvent> = deck.slice(deck.length - n).reverse();
      const options = permutations(top).map((order) =>
        new SelectOption(order.map((e, i) => `${i + 1}. ${e.name}`).join('   ')).andThen(() => {
          deck.splice(deck.length - n, n, ...[...order].reverse());
          game.log('${0} reordered the top global events', (b) => b.player(p));
          return undefined;
        }));
      p.defer(new OrOptions(...options).setTitle('Ares Technology: order the next global events (1 is revealed first)'));
    }
  }
}
