import {InputResponse} from '../../common/inputs/InputResponse';
import {CardType} from '../../common/cards/CardType';
import {SpaceBonus} from '../../common/boards/SpaceBonus';
import {Phase} from '../../common/Phase';
import {PlayerId} from '../../common/Types';
import {Random, UnseededRandom} from '../../common/utils/Random';
import {Game} from '../Game';
import {SerializedDeck} from '../cards/SerializedDeck';
import {SerializedGame} from '../SerializedGame';
import {IPlayer} from '../IPlayer';
import {PlayerInput} from '../PlayerInput';
import {ICard} from '../cards/ICard';
import {ICorporationCard} from '../cards/corporation/ICorporationCard';
import {Space} from '../boards/Space';
import {Simulation} from '../game/Simulation';
import {AndOptions} from '../inputs/AndOptions';
import {InputError} from '../inputs/InputError';
import {OrOptions} from '../inputs/OrOptions';
import {SelectCard} from '../inputs/SelectCard';
import {SelectCardToPlay} from '../inputs/SelectCardToPlay';
import {SelectInitialCards} from '../inputs/SelectInitialCards';
import {SelectOption} from '../inputs/SelectOption';
import {SelectPayment} from '../inputs/SelectPayment';
import {SelectSpace} from '../inputs/SelectSpace';
import {UndoActionOption} from '../inputs/UndoActionOption';
import {autoPayment} from './AutoPayment';
import {IBot} from './IBot';
import {RandomBot} from './RandomBot';
import {generationsLeft, relativeValue} from './StateValue';

const PASS = 'Pass for this generation';

/** Never spend more than this many answers on one simulated option: a loop in the engine must not hang the bot. */
const MAX_SIMULATED_ANSWERS = 80;
/** An option has to beat doing nothing by this much (M€) to be worth taking. */
const MIN_GAIN = 0.25;
/** The most options tried per decision, cheapest first. A big hand on a big table would otherwise take many seconds. */
const MAX_TRIALS = 24;
/** At least this many options are tried however long they take. */
const MIN_TRIALS = 6;
/** How long, in ms, the bot spends trying options per decision unless told otherwise. It blocks the server while it thinks. */
const DEFAULT_THINK_MS = Number(process.env.BOT_THINK_MS ?? 1500);

type Step = {signature: string, response: InputResponse};

type Trial = {response: InputResponse, label: string, /** M€ it costs, to try the cheap ones first. */ cost: number};

type Outcome = {value: number, trail: ReadonlyArray<Step>};

/** How many cards of each draw pile a trial keeps. An action draws a handful at most. */
const TRIAL_DECK_CARDS = 40;

/**
 * The saved game with short decks. Rebuilding every card in a full draw pile is most of the cost of copying a game,
 * and a trial draws nothing like that many. A trial that does run dry just fails and is not chosen.
 */
function trimDecks(game: SerializedGame): SerializedGame {
  const shorten = (deck: SerializedDeck | undefined): SerializedDeck | undefined =>
    deck === undefined ? undefined : {...deck, drawPile: deck.drawPile.slice(-TRIAL_DECK_CARDS), discardPile: []};
  return {
    ...game,
    projectDeck: shorten(game.projectDeck) as SerializedDeck,
    preludeDeck: shorten(game.preludeDeck) as SerializedDeck,
    ceoDeck: shorten(game.ceoDeck) as SerializedDeck,
    corporationDeck: shorten(game.corporationDeck) as SerializedDeck,
  };
}

function titleOf(input: PlayerInput): string {
  return typeof input.title === 'string' ? input.title : input.title.message;
}

function signatureOf(input: PlayerInput): string {
  return `${input.constructor.name}:${titleOf(input)}`;
}

function isActionMenu(input: PlayerInput | undefined): input is OrOptions {
  return input instanceof OrOptions && input.options.some((o) => o instanceof SelectOption && o.title === PASS);
}

/**
 * Plays by trying things out.
 *
 * On its turn it copies the game, takes each option it could take on the copy, and scores what it ends up with (see
 * StateValue). It takes the option that gains the most, or passes when nothing gains anything. Smaller questions inside
 * an option (where a tile goes, how to pay) are answered with simple rules, and the answers that scored best are
 * replayed on the real game, so what happens is what was tried.
 *
 * It only looks one action ahead, and it knows nothing about what the others hold. It plays like a player who always
 * makes the locally best move, which is much better than random and still beatable.
 */
export class HeuristicBot implements IBot {
  private readonly random: RandomBot;
  /** What to answer next in the action being carried out, per seat. */
  private readonly plans = new Map<PlayerId, Array<Step>>();

  /**
   * @param thinkMs how long to spend trying options per decision. Pass Infinity for repeatable play (only the cap on the
   * number of options applies), as the simulator does.
   */
  constructor(private readonly rng: Random = UnseededRandom.INSTANCE, private readonly thinkMs: number = DEFAULT_THINK_MS) {
    this.random = new RandomBot(rng);
  }

  public decide(input: PlayerInput, player: IPlayer, attempt: number): InputResponse {
    if (attempt > 0) {
      // The engine turned the clever answer down. Fall back to guessing so the game keeps moving.
      this.plans.delete(player.id);
      return this.random.decide(input, player, attempt);
    }
    if (isActionMenu(input)) {
      return this.decideAction(input, player);
    }
    const plan = this.plans.get(player.id);
    if (plan !== undefined && plan.length > 0) {
      const next = plan[0];
      if (next.signature === signatureOf(input)) {
        plan.shift();
        return next.response;
      }
      // The game asked something the trial didn't see. Drop the plan rather than answer a different question.
      this.plans.delete(player.id);
    }
    return this.answer(input, player, attempt);
  }

  // -------------------------------------------------------------------------------------------------------------------
  // The action menu
  // -------------------------------------------------------------------------------------------------------------------

  private decideAction(menu: OrOptions, player: IPlayer): InputResponse {
    const game = player.game;
    const pass = this.passResponse(menu);
    const trials = this.trials(menu, player);
    if (trials.length === 0) {
      return pass;
    }

    // One copy of the game's state, parsed afresh for every trial.
    const saved = JSON.stringify(trimDecks(game.serialize()));
    const baseline = relativeValue(game, player);
    const started = Date.now();
    // Cheap options first, so that a time limit cuts the expensive ones.
    const ordered = trials.sort((a, b) => a.cost - b.cost).slice(0, MAX_TRIALS);
    let best: {trial: Trial, outcome: Outcome} | undefined;
    for (let i = 0; i < ordered.length; i++) {
      if (i >= MIN_TRIALS && Date.now() - started > this.thinkMs) {
        break;
      }
      const trial = ordered[i];
      const outcome = this.tryOut(saved, player, trial.response);
      if (outcome !== undefined && (best === undefined || outcome.value > best.outcome.value)) {
        best = {trial, outcome};
      }
    }
    if (best === undefined || best.outcome.value < baseline + MIN_GAIN) {
      this.plans.delete(player.id);
      return pass;
    }
    this.plans.set(player.id, [...best.outcome.trail]);
    return best.trial.response;
  }

  private passResponse(menu: OrOptions): InputResponse {
    const index = menu.options.findIndex((o) => o instanceof SelectOption && o.title === PASS);
    return {type: 'or', index, response: {type: 'option'}};
  }

  /** Everything worth trying from the action menu. */
  private trials(menu: OrOptions, player: IPlayer): Array<Trial> {
    const left = generationsLeft(player.game);
    const result: Array<Trial> = [];
    menu.options.forEach((option, index) => {
      if (option instanceof UndoActionOption) {
        return;
      }
      // Funding an award is paid for now and scored at the end. Not worth the money until the end is near.
      if (typeof option.title === 'string' && option.title.startsWith('Fund an award') && left > 3) {
        return;
      }
      for (const sub of this.subTrials(option, player)) {
        result.push({label: `${titleOf(option)}`, response: {type: 'or', index, response: sub}, cost: this.costOf(sub)});
      }
    });
    return result;
  }

  /** What a response spends, in M€ and resources, for ordering. Zero for anything that isn't a payment. */
  private costOf(response: InputResponse): number {
    if (response.type === 'or') {
      return this.costOf(response.response);
    }
    if (response.type === 'projectCard') {
      return Object.values(response.payment).reduce((sum, n) => sum + (typeof n === 'number' ? n : 0), 0);
    }
    return 0;
  }

  private subTrials(option: PlayerInput, player: IPlayer): Array<InputResponse> {
    if (option instanceof SelectCardToPlay) {
      const responses: Array<InputResponse> = [];
      option.cards.forEach((card, i) => {
        if (option.enabled?.[i] === false) {
          return;
        }
        try {
          responses.push(this.random.cardToPlay(option, player, card, 0, true));
        } catch (e) {
          if (!(e instanceof InputError)) {
            throw e;
          }
        }
      });
      return responses;
    }
    if (option instanceof OrOptions) {
      const responses: Array<InputResponse> = [];
      option.options.forEach((inner, index) => {
        if (inner instanceof UndoActionOption) {
          return;
        }
        for (const sub of this.subTrials(inner, player)) {
          responses.push({type: 'or', index, response: sub});
        }
      });
      return responses;
    }
    if (option instanceof SelectOption) {
      // Passing is the baseline, and ending the turn early gives up an action.
      if (option.title === PASS || option.title === 'End Turn') {
        return [];
      }
      return [{type: 'option'}];
    }
    if (option instanceof SelectCard) {
      // Selling patents gains a card's worth of M€ at best.
      if (option.cards.length === 0 || titleOf(option).toLowerCase().includes('sell')) {
        return [];
      }
      const responses: Array<InputResponse> = [];
      option.cards.forEach((card, i) => {
        if (option.config.enabled?.[i] !== false) {
          responses.push({type: 'card', cards: [card.name]});
        }
      });
      return responses;
    }
    try {
      return [this.random.decide(option, player, 0)];
    } catch (e) {
      if (e instanceof InputError) {
        return [];
      }
      throw e;
    }
  }

  /**
   * Takes `response` on a copy of the game and plays out the rest of that action. Returns the value of what's left and
   * the answers given, or undefined when the engine would not take it.
   */
  private tryOut(saved: string, player: IPlayer, response: InputResponse): Outcome | undefined {
    return Simulation.run(() => {
      let copy;
      try {
        copy = Game.deserialize(JSON.parse(saved));
      } catch (e) {
        return undefined;
      }
      const me = copy.getPlayerById(player.id);
      const trail: Array<Step> = [];
      try {
        me.process(response);
        for (let n = 0; n < MAX_SIMULATED_ANSWERS; n++) {
          const waiting = me.getWaitingFor();
          // Done when the action is over: the turn passed, the phase moved on, or the next action menu is up.
          if (waiting === undefined || copy.phase !== Phase.ACTION || isActionMenu(waiting)) {
            break;
          }
          if (waiting.optional === true) {
            break;
          }
          const step = this.answerAndProcess(waiting, me);
          if (step === undefined) {
            return undefined;
          }
          trail.push(step);
        }
      } catch (e) {
        // The engine refused this option on the copy (or it broke on it). Either way, don't take it.
        return undefined;
      }
      return {value: relativeValue(copy, me), trail};
    });
  }

  /** Answers a question on a copy, trying other ways when the engine refuses an answer. Undefined if every way fails. */
  private answerAndProcess(input: PlayerInput, player: IPlayer): Step | undefined {
    for (let attempt = 0; attempt < 5; attempt++) {
      try {
        const response = attempt === 0 ? this.answer(input, player, 0) : this.random.decide(input, player, attempt);
        player.process(response);
        return {signature: signatureOf(input), response};
      } catch (e) {
        if (!(e instanceof Error) || player.getWaitingFor() === undefined) {
          return undefined;
        }
      }
    }
    return undefined;
  }

  // -------------------------------------------------------------------------------------------------------------------
  // Smaller questions
  // -------------------------------------------------------------------------------------------------------------------

  private answer(input: PlayerInput, player: IPlayer, attempt: number): InputResponse {
    if (input instanceof SelectInitialCards) {
      return this.initialCards(input, player, attempt);
    }
    if (input instanceof AndOptions) {
      return this.random.decide(input, player, attempt);
    }
    if (input instanceof SelectSpace) {
      return {type: 'space', spaceId: this.bestSpace(input.spaces, player).id};
    }
    if (input instanceof SelectPayment) {
      const payment = autoPayment(player, input.amount, input.paymentOptions, input.reserveUnits, this.rng, attempt, true);
      if (payment !== undefined) {
        return {type: 'payment', payment};
      }
    }
    if (input instanceof SelectCardToPlay) {
      const candidates = input.cards.filter((_, i) => input.enabled?.[i] !== false);
      if (candidates.length > 0) {
        // Cheapest first: the likeliest to be affordable and the least to give up.
        const card = [...candidates].sort((a, b) => (a.cost ?? 0) - (b.cost ?? 0))[0];
        return this.random.cardToPlay(input, player, card, attempt, true);
      }
    }
    if (input instanceof SelectCard && input.config.max > 0) {
      const chosen = this.chooseCards(input, player);
      if (chosen !== undefined) {
        return {type: 'card', cards: chosen as Array<any>};
      }
    }
    return this.random.decide(input, player, attempt);
  }

  /** Where a tile goes: the area bonus and adjacent oceans are worth M€, and a tile likes to be near its owner's. */
  private bestSpace(spaces: ReadonlyArray<Space>, player: IPlayer): Space {
    const board = player.game.board;
    let best = spaces[0];
    let bestScore = -Infinity;
    for (const space of spaces) {
      let score = space.bonus.reduce((sum, bonus) => sum + this.bonusValue(bonus), 0);
      let adjacent: ReadonlyArray<Space> = [];
      try {
        adjacent = board.getAdjacentSpaces(space);
      } catch {
        // The space isn't on the main board (the Moon, Venus). Score it by its bonus alone.
      }
      for (const neighbor of adjacent) {
        if (neighbor.tile === undefined) {
          continue;
        }
        if (board.getOceanSpaces().some((o) => o.id === neighbor.id)) {
          score += 2;
        }
        if (neighbor.player === player) {
          score += 0.4;
        }
      }
      score += this.rng.next() * 0.1;
      if (score > bestScore) {
        best = space;
        bestScore = score;
      }
    }
    return best;
  }

  private bonusValue(bonus: SpaceBonus): number {
    switch (bonus) {
    case SpaceBonus.TITANIUM: return 3;
    case SpaceBonus.STEEL: return 2;
    case SpaceBonus.PLANT: return 1.5;
    case SpaceBonus.DRAW_CARD: return 3.4;
    case SpaceBonus.HEAT: return 1;
    case SpaceBonus.OCEAN: return 6;
    case SpaceBonus.MEGACREDITS: return 1;
    case SpaceBonus.ENERGY: return 1;
    default: return 1.5;
    }
  }

  /** Cards to choose, for the kinds of choice where a rule beats a coin flip. Undefined leaves it to the random bot. */
  private chooseCards(input: SelectCard<any>, player: IPlayer): Array<string> | undefined {
    const title = titleOf(input);
    const enabled = input.cards.filter((_, i) => input.config.enabled?.[i] !== false) as Array<ICard>;
    if (enabled.length === 0) {
      return undefined;
    }
    const ranked = [...enabled].sort((a, b) => this.cardScore(b) - this.cardScore(a));
    if (title.includes('to buy')) {
      const left = generationsLeft(player.game);
      const affordable = Math.floor(Math.max(0, player.megaCredits - 8) / 3);
      const count = Math.max(input.config.min, Math.min(input.config.max, affordable, left > 3 ? 4 : 1));
      return ranked.slice(0, count).map((c) => c.name);
    }
    if (input.config.min === 1 && input.config.max === 1 && title.toLowerCase().includes('pass')) {
      // Drafting: keep the best card.
      return [ranked[0].name];
    }
    return undefined;
  }

  /** How good a card looks from its face alone. Only used to rank cards to keep or buy. */
  private cardScore(card: ICard): number {
    const cost = card.cost ?? 0;
    let score = -Math.abs(cost - 14) * 0.15;
    if (card.type === CardType.ACTIVE) {
      score += 1;
    }
    if (card.victoryPoints !== undefined) {
      score += 1.5;
    }
    return score + this.rng.next() * 1.5;
  }

  private initialCards(input: SelectInitialCards, player: IPlayer, attempt: number): InputResponse {
    const responses = input.options.map((option) => {
      if (option instanceof SelectCard) {
        const title = titleOf(option);
        if (option.cards.length > 0 && option.config.min === 1 && option.config.max === 1 && option.cards.every((c) => c.type === CardType.CORPORATION)) {
          // The corporation with the most M€ to start.
          const corp = [...option.cards as ReadonlyArray<ICorporationCard>].sort((a, b) => b.startingMegaCredits - a.startingMegaCredits)[0];
          return {type: 'card', cards: [corp.name]} as InputResponse;
        }
        if (option.config.min === 0 && !title.toLowerCase().includes('prelude') && !title.toLowerCase().includes('ceo')) {
          const ranked = [...option.cards as ReadonlyArray<ICard>].sort((a, b) => this.cardScore(b) - this.cardScore(a));
          return {type: 'card', cards: ranked.slice(0, Math.min(option.config.max, 4)).map((c) => c.name)} as InputResponse;
        }
      }
      return this.random.decide(option, player, attempt);
    });
    return {type: 'initialCards', responses};
  }
}
