import {CardName} from '../../common/cards/CardName';
import {CardResource} from '../../common/CardResource';
import {Tag} from '../../common/cards/Tag';
import {PlayerId} from '../../common/Types';
import {
  ActDevelopmentModel,
  ActKind,
  MARKET_COLUMN_CAP,
  MARKET_RESOURCES,
  MARKET_TRADE_MAX,
  MAX_ACTS_PER_PLAYER,
  MERCURY_TRACK,
  MERCURY_TRACK_FINISH_VP,
  MERCURY_TRACK_MAX,
  MarketResource,
  MercuryModel,
  MercuryTrackReward,
  STARTING_RIVALRIES,
  STARTING_TREATIES,
} from '../../common/mercury/Mercury';
import {TileType} from '../../common/TileType';
import type {SerializedDeck} from '../cards/SerializedDeck';
import type {ActDeck} from './ActDeck';
import {ICard} from '../cards/ICard';
import {IGame} from '../IGame';
import {IPlayer} from '../IPlayer';
import {PlayerInput} from '../PlayerInput';
import {OrOptions} from '../inputs/OrOptions';
import {SelectOption} from '../inputs/SelectOption';
import {SelectCard} from '../inputs/SelectCard';
import {SelectPlayer} from '../inputs/SelectPlayer';
import {SelectAmount} from '../inputs/SelectAmount';
import {SelectResource} from '../inputs/SelectResource';
import {SimpleDeferredAction} from '../deferredActions/DeferredAction';
import {Priority} from '../deferredActions/Priority';
import {message} from '../logs/MessageBuilder';
import {Message} from '../../common/logs/Message';
import {Space} from '../boards/Space';
import {VictoryPointsBreakdownBuilder} from '../game/VictoryPointsBreakdownBuilder';
import type {IActCard} from './ActCard';
import {CardType} from '../../common/cards/CardType';
import {Logger} from '../logs/Logger';
import {sum} from '../../common/utils/utils';
import {Resource} from '../../common/Resource';
import {AddResourcesToCard} from '../deferredActions/AddResourcesToCard';
import {IColonyTrader} from '../colonies/IColonyTrader';
import {IColony} from '../colonies/IColony';
import {MC_TRADE_COST} from '../../common/constants';

/** One Act in development. For a Treaty, only progress[0] (the shared track) is used. */
export type ActDevelopment = {
  card: IActCard;
  initiator: PlayerId;
  partner: PlayerId;
  progress: [number, number];
};

export type MercuryState = {
  actDeck: ActDeck;
  developments: Array<ActDevelopment>;
  /** Mercury planetary track, 0 to MERCURY_TRACK_MAX. */
  track: number;
  /** Resources on Market Colonies. The last column keeps the actual resource types. */
  market: Record<Exclude<MarketResource, 'other'>, number> & {other: Array<CardResource>};
  /** Players who already had their Negotiations phase this generation. */
  negotiated: Array<PlayerId>;
  /** Seed Sharing: at the next production phase, `to` also produces `from`'s plant production. */
  plantShares: Array<{to: PlayerId, from: PlayerId}>;
  /** Tradeship Takeover: `to` controls one of `from`'s trade fleets until generation `until` begins. */
  fleetLoans: Array<{from: PlayerId, to: PlayerId, until: number}>;
};

export type SerializedMercury = {
  actDeck: SerializedDeck;
  developments: Array<{card: CardName, initiator: PlayerId, partner: PlayerId, progress: [number, number]}>;
  track: number;
  market: Record<Exclude<MarketResource, 'other'>, number> & {other: Array<CardResource>};
  negotiated: Array<PlayerId>;
  plantShares?: Array<{to: PlayerId, from: PlayerId}>;
  fleetLoans?: Array<{from: PlayerId, to: PlayerId, until: number}>;
};

/** Which side of an Act a player adds assets to. */
type Side = 0 | 1;

/**
 * Mercury vs Mars (fan expansion by Aphi).
 *
 * - Act cards: every player starts with 2 Treaties and 1 Rivalry. Before their first action each generation
 *   (the Negotiations phase), and later as an action, a player may put an Act into development with another
 *   player. Assets added to an Act move it towards its handshake. A player may take part in at most 2 Acts.
 * - Assets are never kept: they go to the Acts a player takes part in right away, or are lost.
 * - Influence becomes assets (1:1) at the end of the Turmoil phase.
 * - The Mercury planetary track, raised by Mercury tags.
 * - Market Colonies takes the micro-resources (microbes, floaters, data...) a player cannot use, for assets.
 */
export class Mercury {
  public static enabled(game: IGame): boolean {
    return game.mercury !== undefined;
  }

  // ---- Setup and saving -------------------------------------------------------------------------------------

  /** `actDeck` is shuffled here. See ActDeck.ts, which also restores saved games. */
  public static newState(actDeck: ActDeck): MercuryState {
    actDeck.shuffle();
    return {
      actDeck,
      developments: [],
      track: 0,
      market: {microbe: 0, floater: 0, data: 0, other: []},
      negotiated: [],
      plantShares: [],
      fleetLoans: [],
    };
  }

  /** Every player gets 2 Treaties and 1 Rivalry. */
  public static dealStartingActs(game: IGame): void {
    if (!this.enabled(game)) {
      return;
    }
    for (const player of game.players) {
      this.drawActs(player, STARTING_TREATIES, 'treaty', {log: false});
      this.drawActs(player, STARTING_RIVALRIES, 'rivalry', {log: false});
    }
  }

  public static serialize(state: MercuryState): SerializedMercury {
    return {
      actDeck: state.actDeck.serialize(),
      developments: state.developments.map((d) => ({card: d.card.name, initiator: d.initiator, partner: d.partner, progress: [...d.progress]})),
      track: state.track,
      market: {...state.market, other: [...state.market.other]},
      negotiated: [...state.negotiated],
      plantShares: state.plantShares.map((s) => ({...s})),
      fleetLoans: state.fleetLoans.map((l) => ({...l})),
    };
  }

  public static onGenerationStart(game: IGame): void {
    const state = game.mercury;
    if (state === undefined) {
      return;
    }
    state.negotiated = [];
    // Tradeship Takeover: borrowed trade fleets go back.
    const ended = state.fleetLoans.filter((l) => l.until <= game.generation);
    state.fleetLoans = state.fleetLoans.filter((l) => l.until > game.generation);
    for (const loan of ended) {
      game.getPlayerById(loan.to).colonies.decreaseFleetSize();
      game.getPlayerById(loan.from).colonies.increaseFleetSize();
      game.log('${0} got their trade fleet back from ${1}', (b) => b.player(game.getPlayerById(loan.from)).player(game.getPlayerById(loan.to)));
    }
  }

  /** Seed Sharing: at the next production phase, `player` also produces `other`'s plant production. */
  public static sharePlantProduction(player: IPlayer, other: IPlayer): void {
    player.game.mercury?.plantShares.push({to: player.id, from: other.id});
  }

  /** Called at the start of the production phase, before anybody produces. */
  public static onProductionPhase(game: IGame): void {
    const state = game.mercury;
    if (state === undefined) {
      return;
    }
    for (const share of state.plantShares) {
      const to = game.getPlayerById(share.to);
      const plants = game.getPlayerById(share.from).production.plants;
      if (plants > 0) {
        to.stock.add(Resource.PLANTS, plants, {log: true});
      }
    }
    state.plantShares = [];
  }

  /** Tradeship Takeover: `to` controls one of `from`'s trade fleets until the end of the upcoming generation. */
  public static lendTradeFleet(from: IPlayer, to: IPlayer): void {
    const state = from.game.mercury;
    if (state === undefined || from.colonies.getFleetSize() === 0) {
      return;
    }
    from.colonies.decreaseFleetSize();
    to.colonies.increaseFleetSize();
    state.fleetLoans.push({from: from.id, to: to.id, until: from.game.generation + 2});
    from.game.log('${0} took control of a trade fleet of ${1}', (b) => b.player(to).player(from));
  }

  /** Spires of Venus: whenever any player raises Venus, its owner adds 1 data to any card per step. */
  public static onVenusRaised(game: IGame, steps: number): void {
    if (!this.enabled(game) || steps <= 0) {
      return;
    }
    for (const owner of game.playersInGenerationOrder) {
      if (owner.tableau.has(CardName.SPIRES_OF_VENUS)) {
        game.defer(new AddResourcesToCard(owner, CardResource.DATA, {count: steps}));
      }
    }
  }

  // ---- Act cards ----------------------------------------------------------------------------------------------

  /** Draws `count` Act cards into `player`'s Act hand, only of `kind` when given. */
  public static drawActs(player: IPlayer, count: number, kind?: ActKind, options?: {log?: boolean}): Array<IActCard> {
    const state = player.game.mercury;
    if (state === undefined || count <= 0) {
      return [];
    }
    const logger: Logger = player.game;
    const cards = kind === undefined ?
      state.actDeck.drawN(logger, count) :
      this.drawOfKind(state.actDeck, logger, count, kind);
    player.actCardsInHand.push(...cards);
    if (options?.log !== false && cards.length > 0) {
      player.game.log('${0} drew ${1} Act card(s)', (b) => b.player(player).number(cards.length));
      player.game.log('You drew ${0}', (b) => b.cards(cards), {reservedFor: player});
    }
    return cards;
  }

  private static drawOfKind(deck: ActDeck, logger: Logger, count: number, kind: ActKind): Array<IActCard> {
    // Search the draw pile first, then the discard pile, without shuffling the others away.
    const result: Array<IActCard> = [];
    for (const pile of [deck.drawPile, deck.discardPile]) {
      for (let i = pile.length - 1; i >= 0 && result.length < count; i--) {
        if (pile[i].kind === kind) {
          result.push(...pile.splice(i, 1));
        }
      }
    }
    if (result.length < count) {
      logger.log(`There are not enough ${kind} Act cards left.`);
    }
    return result;
  }

  public static participations(player: IPlayer): Array<ActDevelopment> {
    return player.game.mercury?.developments.filter((d) => d.initiator === player.id || d.partner === player.id) ?? [];
  }

  public static canTakePart(player: IPlayer): boolean {
    return this.enabled(player.game) && this.participations(player).length < MAX_ACTS_PER_PLAYER;
  }

  /** The other players `initiator` may develop `card` with (or against). */
  public static validOthers(initiator: IPlayer, card: IActCard): Array<IPlayer> {
    return initiator.opponents.filter((p) => this.canTakePart(p) && card.canDevelop(initiator, p));
  }

  /** The Act cards in `player`'s hand that could go into development now. */
  public static developableActs(player: IPlayer): Array<IActCard> {
    if (!this.canTakePart(player)) {
      return [];
    }
    return player.actCardsInHand.filter((card) => this.validOthers(player, card).length > 0);
  }

  private static sideOf(dev: ActDevelopment, player: IPlayer): Side | undefined {
    if (dev.initiator === player.id) {
      return 0;
    }
    if (dev.partner === player.id) {
      return dev.card.kind === 'treaty' ? 0 : 1;
    }
    return undefined;
  }

  private static remaining(dev: ActDevelopment, side: Side): number {
    const s = dev.card.kind === 'treaty' ? 0 : side;
    return Math.max(0, dev.card.steps[s] - dev.progress[s]);
  }

  /**
   * The Negotiations phase for `player`, right before their first action of a generation.
   * Returns undefined when it was already done, or there is nothing to develop.
   */
  public static negotiations(player: IPlayer): PlayerInput | undefined {
    const state = player.game.mercury;
    if (state === undefined || state.negotiated.includes(player.id)) {
      return undefined;
    }
    state.negotiated.push(player.id);
    if (this.developableActs(player).length === 0) {
      return undefined;
    }
    const develop = this.developInput(player, 'Negotiations phase: choose an Act to develop');
    if (develop === undefined) {
      return undefined;
    }
    return new OrOptions(
      develop,
      new SelectOption('Do not develop an Act now', 'Skip'),
    ).setTitle('Negotiations phase');
  }

  /** The "Develop an Act" action, when the player can take part in another Act. */
  public static developAction(player: IPlayer): PlayerInput | undefined {
    if (this.developableActs(player).length === 0) {
      return undefined;
    }
    return this.developInput(player, 'Develop an Act');
  }

  private static developInput(player: IPlayer, title: string | Message, options?: {noAgreement?: boolean, assets?: number}): SelectCard<IActCard> | undefined {
    const cards = this.developableActs(player);
    if (cards.length === 0) {
      return undefined;
    }
    return new SelectCard(title, 'Develop', cards)
      .andThen(([card]) => {
        player.game.defer(new SimpleDeferredAction(player, () => this.chooseOther(player, card, this.validOthers(player, card), options)));
        return undefined;
      });
  }

  /** Mercurial Base: put an Act into development without the other player's agreement, and add assets to it. */
  public static developWithoutAgreement(player: IPlayer, assets: number): PlayerInput | undefined {
    return this.developInput(player, message('Choose an Act to develop and add ${0} assets to', (b) => b.number(assets)), {noAgreement: true, assets});
  }

  private static chooseOther(player: IPlayer, card: IActCard, candidates: Array<IPlayer>, options?: {noAgreement?: boolean, assets?: number}): PlayerInput | undefined {
    if (candidates.length === 0) {
      player.game.log('${0} found nobody to develop ${1} with', (b) => b.player(player).card(card));
      return undefined;
    }
    const noAgreement = card.kind === 'rivalry' || options?.noAgreement === true;
    const title = card.kind === 'rivalry' ?
      message('Who do you challenge with ${0}?', (b) => b.card(card)) :
      noAgreement ?
        message('Who do you develop ${0} with? (No agreement needed.)', (b) => b.card(card)) :
        message('Who do you propose to develop ${0} with?', (b) => b.card(card));
    const select = new SelectPlayer(candidates, title, card.kind === 'rivalry' ? 'Challenge' : noAgreement ? 'Develop' : 'Propose')
      .andThen((other) => {
        if (card.kind === 'rivalry' || options?.noAgreement === true) {
          this.startDevelopment(card, player, other, options?.assets);
          return undefined;
        }
        // A Treaty needs the other player's agreement.
        player.game.defer(new SimpleDeferredAction(other, () => this.askAgreement(player, other, card, candidates)));
        return undefined;
      });
    if (card.kind === 'treaty' && options?.noAgreement !== true) {
      return new OrOptions(select, new SelectOption('Give up developing this Act', 'Give up')).setTitle(title);
    }
    return select;
  }

  private static askAgreement(initiator: IPlayer, other: IPlayer, card: IActCard, candidates: Array<IPlayer>): PlayerInput {
    return new OrOptions(
      new SelectOption(message('Develop ${0} with ${1}', (b) => b.card(card).player(initiator)), 'Accept').andThen(() => {
        // The other player might have joined another Act in the meantime.
        if (this.canTakePart(initiator) && this.canTakePart(other) && initiator.actCardsInHand.includes(card)) {
          this.startDevelopment(card, initiator, other);
        }
        return undefined;
      }),
      new SelectOption('Decline', 'Decline').andThen(() => {
        initiator.game.log('${0} declined to develop ${1} with ${2}', (b) => b.player(other).card(card).player(initiator));
        const rest = candidates.filter((p) => p !== other && this.canTakePart(p));
        initiator.game.defer(new SimpleDeferredAction(initiator, () => this.chooseOther(initiator, card, rest)));
        return undefined;
      }),
    ).setTitle(message('${0} proposes to develop the Treaty ${1} with you', (b) => b.player(initiator).card(card)));
  }

  /** Puts `card` from `initiator`'s Act hand into development with `partner`. */
  public static startDevelopment(card: IActCard, initiator: IPlayer, partner: IPlayer, assets?: number): ActDevelopment | undefined {
    const state = initiator.game.mercury;
    if (state === undefined) {
      return undefined;
    }
    const idx = initiator.actCardsInHand.indexOf(card);
    if (idx !== -1) {
      initiator.actCardsInHand.splice(idx, 1);
    }
    const dev: ActDevelopment = {card, initiator: initiator.id, partner: partner.id, progress: [0, 0]};
    state.developments.push(dev);
    if (card.kind === 'treaty') {
      initiator.game.log('${0} and ${1} started developing the Treaty ${2}', (b) => b.player(initiator).player(partner).card(card));
    } else {
      initiator.game.log('${0} challenged ${1} with the Rivalry ${2}', (b) => b.player(initiator).player(partner).card(card));
    }
    if (assets !== undefined && assets > 0) {
      this.addAssets(initiator, dev, this.sideOf(dev, initiator) ?? 0, assets);
    }
    // Athena Shipyards: when you play or take part in a Rivalry Act, add an asset to it.
    if (card.kind === 'rivalry') {
      for (const p of [initiator, partner]) {
        if (p.tableau.has(CardName.ATHENA_SHIPYARDS) && state.developments.includes(dev)) {
          this.addAssets(p, dev, this.sideOf(dev, p) ?? 0, 1);
        }
      }
    }
    return dev;
  }

  // ---- Assets -------------------------------------------------------------------------------------------------

  /**
   * `player` gains `count` assets. They go to the Acts `player` takes part in. With two Acts, the player
   * chooses how to split them. Assets that don't fit, or that have no Act to go to, are lost.
   */
  public static gainAssets(player: IPlayer, count: number, options?: {anyAct?: boolean, log?: boolean}): void {
    if (!this.enabled(player.game) || count <= 0) {
      return;
    }
    if (options?.log !== false) {
      player.game.log('${0} gained ${1} asset(s)', (b) => b.player(player).number(count));
    }
    player.game.defer(new SimpleDeferredAction(player, () => this.allocate(player, count, options?.anyAct === true)), Priority.GAIN_RESOURCE_OR_PRODUCTION);
  }

  private static allocate(player: IPlayer, count: number, anyAct: boolean): PlayerInput | undefined {
    const state = player.game.mercury;
    if (state === undefined) {
      return undefined;
    }
    if (anyAct) {
      return this.allocateToAnyAct(player, count);
    }
    const devs = this.participations(player).filter((d) => this.remaining(d, this.sideOf(d, player) ?? 0) > 0);
    if (devs.length === 0) {
      player.game.log('${0} takes part in no Act, so ${1} asset(s) were lost', (b) => b.player(player).number(count));
      return undefined;
    }
    if (devs.length === 1) {
      this.addAssets(player, devs[0], this.sideOf(devs[0], player) ?? 0, count);
      return undefined;
    }
    const [a, b] = devs;
    const remA = this.remaining(a, this.sideOf(a, player) ?? 0);
    const remB = this.remaining(b, this.sideOf(b, player) ?? 0);
    if (count >= remA + remB) {
      this.addAssets(player, a, this.sideOf(a, player) ?? 0, remA);
      this.addAssets(player, b, this.sideOf(b, player) ?? 0, remB);
      return undefined;
    }
    const min = Math.max(0, count - remB);
    const max = Math.min(count, remA);
    return new SelectAmount(
      message('You have ${0} asset(s). How many go to ${1}? The rest go to ${2}.', (b2) => b2.number(count).card(a.card).card(b.card)),
      'Add assets', min, max, true)
      .andThen((amount) => {
        this.addAssets(player, a, this.sideOf(a, player) ?? 0, amount);
        this.addAssets(player, b, this.sideOf(b, player) ?? 0, count - amount);
        return undefined;
      });
  }

  /** Shady Deal: assets can go to ANY Act in development, on either side of a Rivalry. */
  private static allocateToAnyAct(player: IPlayer, count: number): PlayerInput | undefined {
    const state = player.game.mercury;
    if (state === undefined || state.developments.length === 0) {
      player.game.log('There is no Act in development, so ${0} asset(s) were lost', (b) => b.number(count));
      return undefined;
    }
    const options = new OrOptions().setTitle(message('Add ${0} asset(s) to any Act', (b) => b.number(count)));
    for (const dev of state.developments) {
      const initiator = player.game.getPlayerById(dev.initiator);
      const partner = player.game.getPlayerById(dev.partner);
      if (dev.card.kind === 'treaty') {
        options.options.push(new SelectOption(message('${0} (${1} and ${2})', (b) => b.card(dev.card).player(initiator).player(partner))).andThen(() => {
          this.addAssets(player, dev, 0, count);
          return undefined;
        }));
      } else {
        for (const side of [0, 1] as const) {
          const p = side === 0 ? initiator : partner;
          options.options.push(new SelectOption(message('${0}: ${1}\'s track', (b) => b.card(dev.card).player(p))).andThen(() => {
            this.addAssets(player, dev, side, count);
            return undefined;
          }));
        }
      }
    }
    return options;
  }

  /** Adds assets to one side of an Act. Resolves it when its track reaches the handshake. */
  public static addAssets(player: IPlayer, dev: ActDevelopment, side: Side, count: number): void {
    const state = player.game.mercury;
    if (state === undefined || !state.developments.includes(dev) || count <= 0) {
      return;
    }
    const s: Side = dev.card.kind === 'treaty' ? 0 : side;
    const added = Math.min(count, this.remaining(dev, s));
    if (added < count) {
      player.game.log('${0} asset(s) of ${1} did not fit on ${2} and were lost', (b) => b.number(count - added).player(player).card(dev.card));
    }
    if (added <= 0) {
      return;
    }
    dev.progress[s] += added;
    player.game.log('${0} added ${1} asset(s) to ${2}', (b) => b.player(player).number(added).card(dev.card));
    if (this.remaining(dev, s) === 0) {
      const game = player.game;
      if (dev.card.kind === 'treaty') {
        this.resolve(game, dev, game.getPlayerById(dev.initiator), game.getPlayerById(dev.partner));
      } else {
        const winner = game.getPlayerById(s === 0 ? dev.initiator : dev.partner);
        const loser = game.getPlayerById(s === 0 ? dev.partner : dev.initiator);
        this.resolve(game, dev, winner, loser);
      }
    }
  }

  /**
   * Resolves an Act: `owner` (the Treaty initiator, or the Rivalry victor) plays it into their played cards.
   * The player who started it draws a new Act card.
   */
  public static resolve(game: IGame, dev: ActDevelopment, owner: IPlayer, other: IPlayer | undefined): void {
    const state = game.mercury;
    if (state === undefined) {
      return;
    }
    const idx = state.developments.indexOf(dev);
    if (idx === -1) {
      return;
    }
    state.developments.splice(idx, 1);
    if (dev.card.kind === 'treaty') {
      game.log('The Treaty ${0} is resolved', (b) => b.card(dev.card));
    } else if (other !== undefined) {
      game.log('${0} won the Rivalry ${1} against ${2}', (b) => b.player(owner).card(dev.card).player(other));
    }
    this.playResolved(owner, dev.card, other);
    this.drawActs(game.getPlayerById(dev.initiator), 1);
  }

  /** Plays `card` into `owner`'s played cards, which applies its effects. */
  private static playResolved(owner: IPlayer, card: IActCard, other: IPlayer | undefined): void {
    card.resolution = {owner, other};
    owner.playCard(card, undefined, 'add');
  }

  /** Executive Order: resolves any Act now. A Rivalry goes to the player closer to their handshake (the initiator on a tie). */
  public static resolveNow(game: IGame, dev: ActDevelopment): void {
    const initiator = game.getPlayerById(dev.initiator);
    const partner = game.getPlayerById(dev.partner);
    if (dev.card.kind === 'treaty') {
      this.resolve(game, dev, initiator, partner);
      return;
    }
    const partnerAhead = this.remaining(dev, 1) < this.remaining(dev, 0);
    this.resolve(game, dev, partnerAhead ? partner : initiator, partnerAhead ? initiator : partner);
  }

  /** New Pompeii: resolves an Act from `player`'s hand in their favour, with nobody else. */
  public static resolveInFavour(player: IPlayer, card: IActCard): void {
    const idx = player.actCardsInHand.indexOf(card);
    if (idx === -1) {
      return;
    }
    player.actCardsInHand.splice(idx, 1);
    player.game.log('${0} resolved ${1} in their favour', (b) => b.player(player).card(card));
    this.playResolved(player, card, undefined);
    this.drawActs(player, 1);
  }

  public static selectAnyDevelopment(player: IPlayer, title: string, cb: (dev: ActDevelopment) => void): PlayerInput | undefined {
    const state = player.game.mercury;
    if (state === undefined || state.developments.length === 0) {
      return undefined;
    }
    const options = new OrOptions().setTitle(title);
    for (const dev of state.developments) {
      const initiator = player.game.getPlayerById(dev.initiator);
      const partner = player.game.getPlayerById(dev.partner);
      options.options.push(new SelectOption(message('${0} (${1} and ${2})', (b) => b.card(dev.card).player(initiator).player(partner))).andThen(() => {
        cb(dev);
        return undefined;
      }));
    }
    return options;
  }

  // ---- Influence becomes assets ----------------------------------------------------------------------------------

  /** At the end of the Turmoil phase, influence becomes assets 1:1, in player order. */
  public static onTurmoilPhaseEnd(game: IGame): void {
    if (!this.enabled(game) || game.turmoil === undefined) {
      return;
    }
    for (const player of game.playersInGenerationOrder) {
      const influence = game.turmoil.getInfluence(player);
      if (influence > 0) {
        game.log('${0} turned ${1} influence into assets', (b) => b.player(player).number(influence));
        this.gainAssets(player, influence, {log: false});
      }
    }
  }

  // ---- Mercury planetary track -------------------------------------------------------------------------------

  public static onCardPlayed(player: IPlayer, card: ICard): void {
    if (!this.enabled(player.game)) {
      return;
    }
    const count = card.tags.filter((t) => t === Tag.MERCURY).length;
    if (count > 0) {
      this.raiseTrack(player, count);
    }
  }

  public static raiseTrack(player: IPlayer, steps: number): void {
    const state = player.game.mercury;
    if (state === undefined) {
      return;
    }
    const target = Math.min(MERCURY_TRACK_MAX, state.track + steps);
    if (target === state.track) {
      return;
    }
    player.game.log('${0} raised the Mercury track to ${1}', (b) => b.player(player).number(target));
    while (state.track < target) {
      state.track++;
      const space = MERCURY_TRACK[state.track];
      if (space === undefined) {
        continue;
      }
      for (const reward of space.risingPlayer) {
        this.grant(player, reward);
      }
      for (const p of player.game.playersInGenerationOrder) {
        for (const reward of space.everyone) {
          this.grant(p, reward);
        }
      }
      if (state.track === MERCURY_TRACK_MAX) {
        player.game.log('The Mercury track is finished');
      }
    }
  }

  private static grant(player: IPlayer, reward: MercuryTrackReward): void {
    switch (reward) {
    case 'asset':
      this.gainAssets(player, 1);
      break;
    case 'card':
      player.drawCard();
      break;
    case 'act':
      this.drawActs(player, 1);
      break;
    case 'standardResource':
      player.defer(new SelectResource('Mercury track: gain 1 standard resource').andThen((unit) => {
        player.stock.add(unit, 1, {log: true});
        return undefined;
      }));
      break;
    }
  }

  public static calculateVictoryPoints(player: IPlayer, builder: VictoryPointsBreakdownBuilder): void {
    const state = player.game.mercury;
    if (state === undefined || state.track < MERCURY_TRACK_MAX) {
      return;
    }
    const counts = player.game.players.map((p) => p.tags.count(Tag.MERCURY, 'raw'));
    const best = Math.max(...counts);
    if (best > 0 && player.tags.count(Tag.MERCURY, 'raw') === best) {
      builder.setVictoryPoints('victoryPoints', MERCURY_TRACK_FINISH_VP, 'Most Mercury tags (Mercury track)');
    }
  }

  // ---- Market Colonies -------------------------------------------------------------------------------------------

  public static marketColumn(resource: CardResource | undefined): MarketResource | undefined {
    switch (resource) {
    case undefined:
    case CardResource.ANIMAL:
      return undefined;
    case CardResource.MICROBE:
      return 'microbe';
    case CardResource.FLOATER:
      return 'floater';
    case CardResource.DATA:
      return 'data';
    default:
      return 'other';
    }
  }

  public static marketCount(game: IGame, column: MarketResource): number {
    const market = game.mercury?.market;
    if (market === undefined) {
      return 0;
    }
    return column === 'other' ? market.other.length : market[column];
  }

  /**
   * Puts resources `player` cannot use on Market Colonies, for 1 asset each. Each column holds at most
   * MARKET_COLUMN_CAP. Returns how many were placed.
   */
  public static putOnMarket(player: IPlayer, resource: CardResource | undefined, count: number): number {
    const game = player.game;
    const state = game.mercury;
    const column = this.marketColumn(resource);
    if (state === undefined || column === undefined || resource === undefined || count <= 0) {
      return 0;
    }
    const placed = Math.min(count, MARKET_COLUMN_CAP - this.marketCount(game, column));
    if (placed <= 0) {
      game.log('Market Colonies has no room for more ${0}', (b) => b.string(resource));
      return 0;
    }
    if (column === 'other') {
      for (let i = 0; i < placed; i++) {
        state.market.other.push(resource);
      }
    } else {
      state.market[column] += placed;
    }
    game.log('${0} put ${1} ${2} on Market Colonies', (b) => b.player(player).number(placed).string(resource));
    this.gainAssets(player, placed);
    return placed;
  }

  /** Market Colonies accepts these resources. */
  public static acceptsOnMarket(game: IGame, resource: CardResource | undefined): boolean {
    const column = this.marketColumn(resource);
    return this.enabled(game) && column !== undefined && this.marketCount(game, column) < MARKET_COLUMN_CAP;
  }

  /**
   * Trading with Market Colonies: take up to 3 resources of one kind (plus 1 per step of trade boost).
   * They go to a card of yours that holds them; if none can, they are lost.
   */
  public static marketTrade(player: IPlayer, addToCard: (resource: CardResource, count: number) => void): PlayerInput | undefined {
    const state = player.game.mercury;
    if (state === undefined) {
      return undefined;
    }
    const take = MARKET_TRADE_MAX + Math.max(0, player.colonies.tradeOffset);
    const options = new OrOptions().setTitle(message('Take up to ${0} resources of one kind from Market Colonies', (b) => b.number(take)));
    for (const column of MARKET_RESOURCES) {
      if (column === 'other') {
        for (const resource of new Set(state.market.other)) {
          options.options.push(new SelectOption(resource).andThen(() => {
            const n = Math.min(take, state.market.other.filter((r) => r === resource).length);
            for (let i = 0; i < n; i++) {
              state.market.other.splice(state.market.other.indexOf(resource), 1);
            }
            addToCard(resource, n);
            return undefined;
          }));
        }
        continue;
      }
      if (state.market[column] > 0) {
        const resource = column === 'microbe' ? CardResource.MICROBE : column === 'floater' ? CardResource.FLOATER : CardResource.DATA;
        options.options.push(new SelectOption(resource).andThen(() => {
          const n = Math.min(take, state.market[column]);
          state.market[column] -= n;
          addToCard(resource, n);
          return undefined;
        }));
      }
    }
    if (options.options.length === 0) {
      player.game.log('Market Colonies was empty');
      return undefined;
    }
    return options;
  }

  // ---- Tiles ----------------------------------------------------------------------------------------------------

  /** Boreholes: placing a tile next to it gives 1 asset. */
  public static onTilePlaced(player: IPlayer, space: Space): void {
    if (!this.enabled(player.game)) {
      return;
    }
    const boreholes = player.game.board.getAdjacentSpaces(space).filter((s) => s.tile?.tileType === TileType.BOREHOLES);
    if (boreholes.length > 0 && space.tile?.tileType !== TileType.BOREHOLES) {
      this.gainAssets(player, boreholes.length);
    }
  }

  // ---- Trades ---------------------------------------------------------------------------------------------------

  /** Interplanetary Trade Center: 1 asset when you trade. */
  public static onTrade(player: IPlayer): void {
    if (player.tableau.has(CardName.INTERPLANETARY_TRADE_CENTER)) {
      this.gainAssets(player, 1);
    }
  }

  /**
   * Hephaestus Nets: asteroids there pay 6 M€ each for a trade. The rest of the fee, if any, is paid in M€.
   */
  public static colonyTraders(player: IPlayer): Array<IColonyTrader> {
    const nets = player.tableau.get(CardName.HEPHAESTUS_NETS);
    if (nets === undefined || nets.resourceCount === 0) {
      return [];
    }
    const fee = Math.max(0, MC_TRADE_COST - player.colonies.tradeDiscount);
    const asteroids = Math.min(nets.resourceCount, Math.ceil(fee / 6));
    const rest = Math.max(0, fee - asteroids * 6);
    return [{
      canUse: () => player.megaCredits >= rest,
      optionText: () => rest > 0 ?
        message('Pay ${0} asteroid(s) from ${1} and ${2} M€', (b) => b.number(asteroids).cardName(CardName.HEPHAESTUS_NETS).number(rest)) :
        message('Pay ${0} asteroid(s) from ${1}', (b) => b.number(asteroids).cardName(CardName.HEPHAESTUS_NETS)),
      trade: (colony: IColony) => {
        player.removeResourceFrom(nets, asteroids, {log: true});
        if (rest > 0) {
          player.stock.deduct(Resource.MEGACREDITS, rest, {log: true});
        }
        player.game.log('${0} paid with asteroids to trade with ${1}', (b) => b.player(player).colony(colony));
        colony.trade(player);
      },
    }];
  }

  // ---- Model ----------------------------------------------------------------------------------------------------

  public static model(game: IGame): MercuryModel | undefined {
    const state = game.mercury;
    if (state === undefined) {
      return undefined;
    }
    const developments: Array<ActDevelopmentModel> = state.developments.map((d) => ({
      card: d.card.name,
      kind: d.card.kind,
      initiator: game.getPlayerById(d.initiator).color,
      partner: game.getPlayerById(d.partner).color,
      steps: [d.card.steps[0], d.card.steps[1]],
      progress: [d.progress[0], d.progress[1]],
    }));
    return {
      track: state.track,
      market: {microbe: state.market.microbe, floater: state.market.floater, data: state.market.data, other: state.market.other.length},
      developments,
      actDeckSize: state.actDeck.drawPile.length,
      actDiscardSize: state.actDeck.discardPile.length,
    };
  }

  /** Number of Act cards in `player`'s played cards (Opportunist, Tycoonist). */
  public static playedActs(player: IPlayer): number {
    return sum(player.playedCards.asArray().map((c) => c.type === CardType.ACT ? 1 : 0));
  }
}
