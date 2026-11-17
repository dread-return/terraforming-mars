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
import {PlaceCityTile} from '../../deferredActions/PlaceCityTile';
import {PlayerInput} from '../../PlayerInput';
import {EpicUtils} from './EpicUtils';

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
export class EpicHooks {
  /** Called whenever a player raises a global parameter during the action phase. */
  public static onGlobalParameterIncrease(activePlayer: IPlayer, parameter: GlobalParameter, steps: number): void {
    if (steps <= 0 || activePlayer.game === undefined) {
      return;
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
    if (count > 0 && player.tableau.has(CardName.DEV_WRIGHT)) {
      player.stock.add(Resource.MEGACREDITS, (bought ? 1 : 2) * count, {log: true});
    }
  }

  /**
   * Cheap Chispa: every decrease of the owner's energy production is 1 step smaller.
   * Returns the adjusted amount.
   */
  public static adjustProductionChange(player: IPlayer, resource: Resource, amount: number): number {
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
    const fromOtherPlayer = isFromPlayer(from) && from.player.id !== player.id;

    // The player's own corporations.
    if (delta > 0) {
      // Toyitsu and Ares Union: remember which productions were raised this generation.
      for (const name of [CardName.TOYITSU, CardName.ARES_UNION]) {
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
    }
  }

  /** Called when resources were removed from a card. */
  public static onCardResourceRemoved(owner: IPlayer, card: ICard, removingPlayer?: IPlayer): void {
    const type = card.resourceType;
    if (type === undefined || removingPlayer === undefined || removingPlayer.id === owner.id) {
      return;
    }
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
    const coeurl = player.tableau.get(CardName.COEURL_INDUSTRIES);
    if (coeurl === undefined || project.name === CardName.SELL_PATENTS_STANDARD_PROJECT) {
      return base;
    }
    if (dataOf<{acting?: boolean}>(coeurl).acting !== true) {
      return base;
    }
    return {...base, steel: true, titanium: true};
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
    if (options.length === 0) {
      return undefined;
    }
    return new OrOptions(...options).setTitle('Free conversions (Epic corporations)');
  }

  /** Called at the start of each generation. */
  public static onGenerationStart(game: IGame): void {
    for (const p of game.players) {
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
