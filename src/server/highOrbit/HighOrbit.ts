import {CardName} from '../../common/cards/CardName';
import {CardType} from '../../common/cards/CardType';
import {Tag} from '../../common/cards/Tag';
import {CardResource} from '../../common/CardResource';
import {Resource} from '../../common/Resource';
import {PlayerId} from '../../common/Types';
import {Random} from '../../common/utils/Random';
import {
  INFRASTRUCTURE_CATEGORIES,
  INFRASTRUCTURE_DESIGNS,
  INFRASTRUCTURES_PER_CATEGORY,
  INFRASTRUCTURE_CATEGORY_TITLES,
  InfrastructureCategory,
  InfrastructureDesign,
  InfrastructureSectorModel,
  infrastructureDesign,
  MAX_INFRASTRUCTURE_COPIES,
  PLANETARY_TAGS,
} from '../../common/highOrbit/HighOrbit';
import {Deck} from '../cards/Deck';
import {highOrbitStandardProjectPayWith} from './HighOrbitPayWith';
import {IActionCard, ICard, isIActionCard} from '../cards/ICard';
import {IProjectCard} from '../cards/IProjectCard';
import {newProjectCard} from '../createCard';
import {GameOptions} from '../game/GameOptions';
import {IGame} from '../IGame';
import {IPlayer} from '../IPlayer';
import {Payment} from '../../common/inputs/Payment';
import {SelectInfrastructure} from '../inputs/SelectInfrastructure';
import {PlayerInput} from '../PlayerInput';
import {SelectOption} from '../inputs/SelectOption';
import {OrOptions} from '../inputs/OrOptions';
import {message} from '../logs/MessageBuilder';
import {PlanetaryEngineeringCorps} from '../cards/highorbit/PlanetaryEngineeringCorps';
import {Spacetek} from '../cards/highorbit/Spacetek';
import {GlobalParameter} from '../../common/GlobalParameter';
import {isOreConverter} from '../cards/highorbit/InfrastructureCard';
import {IColony} from '../colonies/IColony';
import {MAX_COLONY_TRACK_POSITION} from '../../common/constants';
import {Phase} from '../../common/Phase';
import {SimpleDeferredAction} from '../deferredActions/DeferredAction';
import {Priority} from '../deferredActions/Priority';
import {SelectAmount} from '../inputs/SelectAmount';
import {StandardProjectCanPayWith} from '../../common/cards/Types';

/** Which six stacks are in the game, and which sections already have a player cube this generation. */
export type HighOrbitState = {
  sectors: Record<InfrastructureCategory, Array<CardName>>;
  used: Partial<Record<InfrastructureCategory, PlayerId>>;
};

export type SerializedHighOrbit = HighOrbitState;

/** Stacks that need another expansion. */
const COMPATIBILITY: Partial<Record<CardName, (options: GameOptions) => boolean>> = {
  [CardName.COMSAT]: (options) => options.coloniesExtension,
  [CardName.FREIGHTERS]: (options) => options.coloniesExtension,
  [CardName.MOONSAT]: (options) => options.moonExpansion,
  [CardName.VENUS_SAT]: (options) => options.venusNextExtension,
  // TODO(Leo): agents are not in the game, so Spysat is never dealt.
  [CardName.SPYSAT]: () => false,
};


/**
 * High Orbit infrastructures, with the Epic rules (MEGA.pdf, printed p. 21).
 *
 * - Six stacks are in play, two per section (satellites, ore producing, advanced), each with one copy per player.
 * - As an action a player puts a cube on a section that has no cube yet this generation and buys one card of that
 *   section, paying its cost in titanium. Buying an infrastructure ends the player's turn.
 * - A player needs more space tags than infrastructure tags to buy one.
 * - Cubes are removed at the end of the generation.
 * - Infrastructures are silver cards (`CardType.INFRASTRUCTURE`): their tags count, their actions and effects work,
 *   but they never count as blue cards.
 */
export class HighOrbit {
  public static enabled(game: IGame): boolean {
    return game.highOrbit !== undefined;
  }

  public static isInfrastructure(card: ICard): boolean {
    return card.type === CardType.INFRASTRUCTURE;
  }

  // ---- Setup and saving -------------------------------------------------------------------------------------

  public static newState(options: GameOptions, rng: Random): HighOrbitState {
    const banned = new Set(options.bannedCards ?? []);
    const sectors = {} as Record<InfrastructureCategory, Array<CardName>>;
    for (const category of INFRASTRUCTURE_CATEGORIES) {
      const candidates = INFRASTRUCTURE_DESIGNS
        .filter((d) => d.category === category)
        .filter((d) => !banned.has(d.name))
        .filter((d) => COMPATIBILITY[d.name]?.(options) ?? true)
        .map((d) => d.name);
      Deck.shuffle(candidates, rng);
      sectors[category] = candidates.slice(0, INFRASTRUCTURES_PER_CATEGORY);
    }
    return {sectors, used: {}};
  }

  public static serialize(state: HighOrbitState): SerializedHighOrbit {
    return {
      sectors: {
        satellites: [...state.sectors.satellites],
        oreProducing: [...state.sectors.oreProducing],
        advanced: [...state.sectors.advanced],
      },
      used: {...state.used},
    };
  }

  public static deserialize(d: SerializedHighOrbit): HighOrbitState {
    return {
      sectors: {
        satellites: [...(d.sectors?.satellites ?? [])],
        oreProducing: [...(d.sectors?.oreProducing ?? [])],
        advanced: [...(d.sectors?.advanced ?? [])],
      },
      used: {...(d.used ?? {})},
    };
  }

  /** Hooks the project deck so Salvage Depot sees discards. Call after `game.highOrbit` and the deck exist. */
  public static attach(game: IGame): void {
    if (game.highOrbit !== undefined) {
      game.projectDeck.onDiscard = (cards) => HighOrbit.onProjectCardsDiscarded(game, cards);
    }
  }

  /** At the end of the generation, all player cubes leave the sections. */
  public static onGenerationStart(game: IGame): void {
    if (game.highOrbit !== undefined) {
      game.highOrbit.used = {};
    }
  }

  // ---- Stacks ------------------------------------------------------------------------------------------------

  /** One copy of each stack per player. */
  public static copiesPerStack(game: IGame): number {
    return Math.min(Math.max(game.players.length, 1), MAX_INFRASTRUCTURE_COPIES);
  }

  private static ownedNames(game: IGame): Set<CardName> {
    const names = new Set<CardName>();
    for (const player of game.players) {
      for (const card of player.tableau) {
        names.add(card.name);
      }
    }
    return names;
  }

  /** The copies of a stack still on the board, top card first. */
  public static remainingCopies(game: IGame, design: InfrastructureDesign): Array<CardName> {
    const owned = HighOrbit.ownedNames(game);
    return design.copies.slice(0, HighOrbit.copiesPerStack(game)).filter((name) => !owned.has(name));
  }

  /** The first copy of a design nobody owns, whether the stack is on the board or not (Lagrange Collective). */
  public static anyFreeCopy(game: IGame, design: InfrastructureDesign): CardName | undefined {
    const owned = HighOrbit.ownedNames(game);
    return design.copies.find((name) => !owned.has(name));
  }

  public static categoryOf(game: IGame, name: CardName): InfrastructureCategory | undefined {
    const state = game.highOrbit;
    const design = infrastructureDesign(name);
    if (state === undefined || design === undefined) {
      return undefined;
    }
    return INFRASTRUCTURE_CATEGORIES.find((c) => state.sectors[c].includes(design.name));
  }

  // ---- Buying -----------------------------------------------------------------------------------------------

  public static spaceTags(player: IPlayer): number {
    return player.tags.count(Tag.SPACE);
  }

  public static infrastructureTags(player: IPlayer): number {
    return player.tags.count(Tag.INFRASTRUCTURE, 'raw');
  }

  /** You need more space tags than infrastructure tags. */
  public static meetsSpaceRequirement(player: IPlayer): boolean {
    return HighOrbit.spaceTags(player) > HighOrbit.infrastructureTags(player);
  }

  /** Why `player` cannot buy from this stack now, or undefined when they can. */
  public static disabledReason(player: IPlayer, design: InfrastructureDesign): string | undefined {
    const game = player.game;
    const state = game.highOrbit;
    if (state === undefined) {
      return 'High Orbit is not in this game';
    }
    const category = HighOrbit.categoryOf(game, design.name);
    if (category === undefined) {
      return 'Not in this game';
    }
    if (state.used[category] !== undefined) {
      return 'This section was already used this generation';
    }
    const remaining = HighOrbit.remainingCopies(game, design);
    if (remaining.length === 0) {
      return 'No copies left';
    }
    // Orbital Shipyard ore counts as titanium here.
    if (player.titanium + HighOrbit.shipyardOre(player) < design.cost) {
      return 'Not enough titanium';
    }
    if (!HighOrbit.meetsSpaceRequirement(player)) {
      return 'You need more space tags than infrastructure tags';
    }
    const card = newProjectCard(remaining[0]);
    if (card === undefined || !card.canPlay(player, {cost: 0})) {
      return 'Requirements not met';
    }
    return undefined;
  }

  public static canBuyAny(player: IPlayer): boolean {
    const state = player.game.highOrbit;
    if (state === undefined) {
      return false;
    }
    return INFRASTRUCTURE_CATEGORIES.some((c) => state.sectors[c].some((name) => {
      const design = infrastructureDesign(name);
      return design !== undefined && HighOrbit.disabledReason(player, design) === undefined;
    }));
  }

  /**
   * Starts buying from a stack. With ore on Orbital Shipyard (worth 1 titanium each here) the player first says
   * how much of it to use; otherwise the purchase happens at once.
   */
  public static startPurchase(player: IPlayer, design: InfrastructureDesign): PlayerInput | undefined {
    const ore = HighOrbit.shipyardOre(player);
    const min = Math.max(0, design.cost - player.titanium);
    const max = Math.min(ore, design.cost);
    if (max > min) {
      return new SelectAmount(message('How much Orbital Shipyard ore to spend on ${0}? (1 titanium each)', (b) => b.cardName(design.name)), 'Buy', min, max)
        .andThen((amount) => {
          HighOrbit.buy(player, design, amount);
          return undefined;
        });
    }
    HighOrbit.buy(player, design, min);
    return undefined;
  }

  /**
   * Buy the top copy of a stack: place the player's cube on its section, pay titanium (and `shipyardOre` ore from
   * Orbital Shipyard in place of titanium), play the card. Buying ends the turn.
   */
  public static buy(player: IPlayer, design: InfrastructureDesign, shipyardOre: number = 0): IProjectCard {
    const game = player.game;
    const state = game.highOrbit;
    const reason = HighOrbit.disabledReason(player, design);
    if (state === undefined || reason !== undefined) {
      throw new Error(reason ?? 'High Orbit is not in this game');
    }
    const category = HighOrbit.categoryOf(game, design.name);
    if (category === undefined) {
      throw new Error(`${design.name} is not in this game`);
    }
    const name = HighOrbit.remainingCopies(game, design)[0];
    const card = newProjectCard(name);
    if (card === undefined) {
      throw new Error(`Card ${name} not found`);
    }
    const ore = Math.min(shipyardOre, design.cost);
    if (design.cost - ore > player.titanium) {
      throw new Error('Not enough titanium');
    }
    state.used[category] = player.id;
    game.log('${0} put a cube on the ${1} infrastructures and bought ${2}', (b) => b.player(player).string(INFRASTRUCTURE_CATEGORY_TITLES[category]).card(card));
    if (ore > 0) {
      HighOrbit.spendShipyardOre(player, ore);
    }
    player.playCard(card, Payment.of({titanium: design.cost - ore}));
    HighOrbit.endTurn(player);
    return card;
  }

  /** Playing an infrastructure immediately ends the current turn. */
  public static endTurn(player: IPlayer): void {
    player.actionsTakenThisRound = player.availableActionsThisRound;
  }

  /** Places a copy in play for free (Lagrange Collective). No cube, no cost, no requirement. */
  public static placeForFree(player: IPlayer, base: CardName): IProjectCard | undefined {
    const design = infrastructureDesign(base);
    if (design === undefined) {
      return undefined;
    }
    const game = player.game;
    const onBoard = HighOrbit.categoryOf(game, base) !== undefined ? HighOrbit.remainingCopies(game, design)[0] : undefined;
    const name = onBoard ?? HighOrbit.anyFreeCopy(game, design);
    if (name === undefined) {
      game.log('${0} could not take a free ${1}: no copies left', (b) => b.player(player).cardName(base));
      return undefined;
    }
    const card = newProjectCard(name);
    if (card === undefined) {
      return undefined;
    }
    player.playCard(card, undefined);
    return card;
  }

  public static sectorsModel(player: IPlayer): Array<InfrastructureSectorModel> {
    const game = player.game;
    const state = game.highOrbit;
    if (state === undefined) {
      return [];
    }
    return INFRASTRUCTURE_CATEGORIES.map((category) => {
      const usedBy = state.used[category];
      return {
        category,
        usedBy: usedBy === undefined ? undefined : game.getPlayerById(usedBy).color,
        stacks: state.sectors[category].map((name) => {
          const design = infrastructureDesign(name);
          if (design === undefined) {
            throw new Error(`${name} is not an infrastructure`);
          }
          const remaining = HighOrbit.remainingCopies(game, design);
          return {
            card: remaining[0] ?? design.name,
            remaining: remaining.length,
            disabledReason: HighOrbit.disabledReason(player, design),
          };
        }),
      };
    });
  }

  // ---- Card helpers -----------------------------------------------------------------------------------------

  /** Every copy of a design this player owns. */
  public static ownedCopies(player: IPlayer, base: CardName): Array<ICard> {
    const design = infrastructureDesign(base);
    if (design === undefined) {
      return [];
    }
    return design.copies
      .map((name) => player.tableau.get(name))
      .filter((card): card is ICard => card !== undefined);
  }

  public static countOwned(player: IPlayer, base: CardName): number {
    return HighOrbit.ownedCopies(player, base).length;
  }

  /** Comsat: every time you trade, 1 M€ per Comsat. */
  public static onTrade(player: IPlayer): void {
    const count = HighOrbit.countOwned(player, CardName.COMSAT);
    if (count > 0) {
      player.stock.add(Resource.MEGACREDITS, count, {log: true});
    }
  }

  /** Ore on every copy of a design the player owns. */
  private static oreOn(player: IPlayer, base: CardName): number {
    return HighOrbit.ownedCopies(player, base).reduce((sum, card) => sum + card.resourceCount, 0);
  }

  private static spendOreOn(player: IPlayer, base: CardName, count: number): void {
    let left = count;
    for (const card of HighOrbit.ownedCopies(player, base)) {
      const take = Math.min(left, card.resourceCount);
      if (take > 0) {
        player.removeResourceFrom(card, take, {log: true});
        left -= take;
      }
    }
    if (left > 0) {
      throw new Error(`Not enough ore on ${base}`);
    }
  }

  /** Ore on every Propellant Depot the player owns. It pays 2 M€ each for cards with a planetary tag. */
  public static propellantOre(player: IPlayer): number {
    return HighOrbit.oreOn(player, CardName.PROPELLANT_DEPOT);
  }

  public static spendPropellantOre(player: IPlayer, count: number): void {
    HighOrbit.spendOreOn(player, CardName.PROPELLANT_DEPOT, count);
  }

  public static canPayWithPropellantOre(card: {tags: ReadonlyArray<Tag>}): boolean {
    return card.tags.some((tag) => PLANETARY_TAGS.includes(tag));
  }

  /** Ore on every Orbital Shipyard: 1 titanium for infrastructures, 3 M€ for the Build Colony standard project. */
  public static shipyardOre(player: IPlayer): number {
    return HighOrbit.oreOn(player, CardName.ORBITAL_SHIPYARD);
  }

  public static spendShipyardOre(player: IPlayer, count: number): void {
    HighOrbit.spendOreOn(player, CardName.ORBITAL_SHIPYARD, count);
  }

  /** Orbital Shipyard ore pays for the Build Colony standard project. */
  public static standardProjectPayWith(player: IPlayer, card: ICard, base: StandardProjectCanPayWith): StandardProjectCanPayWith {
    return highOrbitStandardProjectPayWith(player, card, base);
  }

  /** Total ore on the player's cards (Ore Refinery VP). */
  public static oreOnCards(player: IPlayer): number {
    return player.getResourceCards(CardResource.ORE).reduce((sum, card) => sum + card.resourceCount, 0);
  }

  /** Silver card actions already used this generation (Trojan Space Logistics). */
  public static usedInfrastructureActions(player: IPlayer): Array<IActionCard & ICard> {
    const result: Array<IActionCard & ICard> = [];
    for (const card of player.tableau) {
      if (card.type !== CardType.INFRASTRUCTURE) {
        continue;
      }
      if (!isIActionCard(card)) {
        continue;
      }
      if (player.actionsThisGeneration.has(card.name) && card.canAct(player)) {
        result.push(card);
      }
    }
    return result;
  }

  // ---- Action menu -------------------------------------------------------------------------------------------

  /** The Infrastructures menu, shown right above the standard projects. */
  public static infrastructureOption(player: IPlayer): PlayerInput | undefined {
    if (player.game.highOrbit === undefined) {
      return undefined;
    }
    return new SelectInfrastructure(player).andThen((design) => HighOrbit.startPurchase(player, design));
  }

  /** Planetary Engineering Corps: the discounted standard project menu. */
  public static pecOption(player: IPlayer): PlayerInput | undefined {
    const pec = player.tableau.get(CardName.PLANETARY_ENGINEERING_CORPS);
    if (!(pec instanceof PlanetaryEngineeringCorps)) {
      return undefined;
    }
    return pec.standardProjectOption(player);
  }

  /** Spacetek: any other player may use its action (once per generation in all). */
  public static spacetekOptions(player: IPlayer): PlayerInput | undefined {
    const options: Array<SelectOption> = [];
    for (const owner of player.game.players) {
      if (owner === player) {
        continue;
      }
      const card = owner.tableau.get(CardName.SPACETEK);
      if (!(card instanceof Spacetek) || !card.canUse(player)) {
        continue;
      }
      options.push(new SelectOption(message('Use the action of ${0} (${1}): 13 M€ for 1 titanium production', (b) => b.card(card).player(owner)), 'Use').andThen(() => {
        card.use(player);
        return undefined;
      }));
    }
    if (options.length === 0) {
      return undefined;
    }
    if (options.length === 1) {
      return options[0];
    }
    return new OrOptions(...options).setTitle('Use the Spacetek action');
  }

  // ---- Hooks ------------------------------------------------------------------------------------------------

  /** Weather Satellite (Epic): 1 M€ per temperature or oxygen step you raise, and per ocean you place. */
  public static onGlobalParameterIncrease(player: IPlayer, parameter: GlobalParameter, steps: number): void {
    if (parameter !== GlobalParameter.TEMPERATURE && parameter !== GlobalParameter.OXYGEN && parameter !== GlobalParameter.OCEANS) {
      return;
    }
    const count = HighOrbit.countOwned(player, CardName.WEATHER_SATELLITE);
    if (count > 0 && steps > 0) {
      player.stock.add(Resource.MEGACREDITS, count * steps, {log: true});
    }
  }

  /** Spacetek: its owner gains 1 titanium per step any player's titanium production goes up. */
  public static onProductionIncrease(player: IPlayer, resource: Resource, amount: number): void {
    // Some tests use players that are not in a game.
    if (resource !== Resource.TITANIUM || amount <= 0 || player.game === undefined) {
      return;
    }
    for (const owner of player.game.players) {
      const card = owner.tableau.get(CardName.SPACETEK);
      if (card instanceof Spacetek && card.started) {
        owner.stock.add(Resource.TITANIUM, amount, {log: true, from: {card}});
      }
    }
  }

  // ---- Free ore conversions ----------------------------------------------------------------------------------

  /**
   * "N ore here can be converted at any time" (Asteroid Mine, Auto Factory, Space Trading Station): an entry in the
   * action menu that does not use up an action, so it can be taken as often as the ore allows.
   */
  public static oreConversionOption(player: IPlayer): PlayerInput | undefined {
    const options: Array<SelectOption> = [];
    for (const card of player.tableau) {
      if (card.type !== CardType.INFRASTRUCTURE || !isOreConverter(card)) {
        continue;
      }
      for (const conversion of card.oreConversions) {
        const max = Math.floor(card.resourceCount / conversion.ore);
        if (max < 1) {
          continue;
        }
        const run = (times: number) => {
          player.freeActionTaken = true;
          player.removeResourceFrom(card, times * conversion.ore, {log: false});
          player.game.log('${0} converted ${1} ore on ${2}', (b) => b.player(player).number(times * conversion.ore).card(card));
          conversion.apply(player, times);
          return undefined;
        };
        options.push(new SelectOption(message('${0}: ${1}', (b) => b.card(card).string(conversion.title)), 'Convert').andThen(() => {
          if (max === 1) {
            return run(1);
          }
          return new SelectAmount(message('How many times? (${0})', (b) => b.string(conversion.title)), 'Convert', 1, max, true).andThen(run);
        }));
      }
    }
    if (options.length === 0) {
      return undefined;
    }
    return new OrOptions(...options).setTitle('Convert ore (free action)');
  }

  // ---- Freighters ---------------------------------------------------------------------------------------------

  /** Freighters: when you trade, you may spend 1 ore on each Freighters to raise that colony's track 1 step. */
  public static freightersBeforeTrade(player: IPlayer, colony: IColony): PlayerInput | undefined {
    const withOre = HighOrbit.ownedCopies(player, CardName.FREIGHTERS).filter((card) => card.resourceCount > 0);
    const room = MAX_COLONY_TRACK_POSITION - colony.trackPosition;
    const max = Math.min(withOre.length, room);
    if (max <= 0) {
      return undefined;
    }
    return new SelectAmount(
      message('Spend ore on Freighters to raise the ${0} track before trading? (1 ore and 1 step per Freighters card)', (b) => b.colony(colony)),
      'Confirm', 0, max)
      .andThen((amount) => {
        for (const card of withOre.slice(0, amount)) {
          player.removeResourceFrom(card, 1, {log: true});
        }
        if (amount > 0) {
          colony.increaseTrack(amount);
          player.game.log('${0} raised the ${1} track ${2} step(s) with Freighters', (b) => b.player(player).colony(colony).number(amount));
        }
        return undefined;
      });
  }

  // ---- Salvage Depot ------------------------------------------------------------------------------------------

  private static salvageSuppressed = false;

  /** Runs `fn` without Salvage Depot reacting to the cards it discards. */
  public static withoutSalvage(fn: () => void): void {
    const before = HighOrbit.salvageSuppressed;
    HighOrbit.salvageSuppressed = true;
    try {
      fn();
    } finally {
      HighOrbit.salvageSuppressed = before;
    }
  }

  /** Called by the project deck whenever cards go to the discard pile. */
  public static onProjectCardsDiscarded(game: IGame, cards: ReadonlyArray<IProjectCard>): void {
    if (game.highOrbit === undefined || HighOrbit.salvageSuppressed || game.phase !== Phase.ACTION || cards.length === 0) {
      return;
    }
    const owners = game.players.filter((p) => HighOrbit.oreOn(p, CardName.SALVAGE_DEPOT) > 0);
    if (owners.length === 0) {
      return;
    }
    const pending = HighOrbit.pendingDiscards.get(game);
    if (pending !== undefined) {
      pending.push(...cards);
      return;
    }
    const batch: Array<IProjectCard> = [...cards];
    HighOrbit.pendingDiscards.set(game, batch);
    // Once the current action has finished discarding, each owner may take one of the discarded cards.
    game.defer(new SimpleDeferredAction(owners[0], () => {
      HighOrbit.pendingDiscards.delete(game);
      for (const owner of owners) {
        owner.defer(() => HighOrbit.salvageOffer(owner, batch));
      }
      return undefined;
    }, Priority.BACK_OF_THE_LINE));
  }

  private static pendingDiscards = new WeakMap<IGame, Array<IProjectCard>>();

  private static salvageOffer(player: IPlayer, batch: ReadonlyArray<IProjectCard>): PlayerInput | undefined {
    const game = player.game;
    const available = batch.filter((card) => game.projectDeck.discardPile.includes(card));
    if (available.length === 0 || HighOrbit.oreOn(player, CardName.SALVAGE_DEPOT) === 0) {
      return undefined;
    }
    return new OrOptions(
      new SelectOption(message('Spend 1 ore on Salvage Depot to draw 1 of the ${0} discarded cards at random', (b) => b.number(available.length)), 'Draw').andThen(() => {
        HighOrbit.spendOreOn(player, CardName.SALVAGE_DEPOT, 1);
        const card = available[Math.floor(game.rng.nextInt(available.length))];
        const idx = game.projectDeck.discardPile.indexOf(card);
        if (idx >= 0) {
          game.projectDeck.discardPile.splice(idx, 1);
          player.cardsInHand.push(card);
          game.log('${0} drew a discarded card with Salvage Depot', (b) => b.player(player));
        }
        return undefined;
      }),
      new SelectOption('Do not use Salvage Depot').andThen(() => undefined),
    ).setTitle('Salvage Depot');
  }
}
