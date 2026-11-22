import {AresGlobalParametersResponse} from '../../common/inputs/AresGlobalParametersResponse';
import {InputResponse} from '../../common/inputs/InputResponse';
import {Payment} from '../../common/inputs/Payment';
import {Random, UnseededRandom} from '../../common/utils/Random';
import {Units} from '../../common/Units';
import {IPlayer} from '../IPlayer';
import {PlayerInput} from '../PlayerInput';
import {DeltaProjectInput} from '../delta/DeltaProjectInput';
import {HighOrbit} from '../highOrbit/HighOrbit';
import {AndOptions} from '../inputs/AndOptions';
import {GainResources} from '../inputs/GainResources';
import {InputError} from '../inputs/InputError';
import {OrOptions} from '../inputs/OrOptions';
import {SelectAmount} from '../inputs/SelectAmount';
import {SelectCard} from '../inputs/SelectCard';
import {SelectCardToPlay} from '../inputs/SelectCardToPlay';
import {SelectClaimedUndergroundToken} from '../inputs/SelectClaimedUndergroundToken';
import {SelectColony} from '../inputs/SelectColony';
import {SelectDelegate} from '../inputs/SelectDelegate';
import {SelectGlobalEvent} from '../inputs/SelectGlobalEvent';
import {SelectInfrastructure} from '../inputs/SelectInfrastructure';
import {SelectInitialCards} from '../inputs/SelectInitialCards';
import {SelectOption} from '../inputs/SelectOption';
import {SelectParty} from '../inputs/SelectParty';
import {SelectPayment} from '../inputs/SelectPayment';
import {SelectPlayer} from '../inputs/SelectPlayer';
import {SelectProductionToLose} from '../inputs/SelectProductionToLose';
import {SelectResource} from '../inputs/SelectResource';
import {SelectResources} from '../inputs/SelectResources';
import {SelectSpace} from '../inputs/SelectSpace';
import {SelectStandardProjectToPlay} from '../inputs/SelectStandardProjectToPlay';
import {ShiftAresGlobalParameters} from '../inputs/ShiftAresGlobalParameters';
import {UndoActionOption} from '../inputs/UndoActionOption';
import {IProjectCard} from '../cards/IProjectCard';
import {IBot} from './IBot';
import {autoPayment} from './AutoPayment';

/** Thrown for an input class the bots don't know how to answer. The simulator reports these as gaps in the bot. */
export class UnsupportedInputError extends Error {
  constructor(input: PlayerInput) {
    super(`The bot cannot answer ${input.constructor.name} (type '${input.type}')`);
  }
}

/**
 * Plays by picking uniformly among the legal answers.
 *
 * Its job is coverage, not strength: it exists to drive games through every expansion, map and option so bugs show up
 * (see src/tools/botSim.ts). A few weights keep games moving: it passes only some of the time, favors conversions, and
 * never asks to undo.
 */
export class RandomBot implements IBot {
  constructor(private readonly rng: Random = UnseededRandom.INSTANCE) {}

  public decide(input: PlayerInput, player: IPlayer, attempt: number): InputResponse {
    // Order matters: subclasses before their base classes.
    if (input instanceof UndoActionOption) {
      throw new InputError('The bot never undoes');
    }
    if (input instanceof OrOptions) {
      return this.decideOr(input, player, attempt);
    }
    if (input instanceof GainResources) {
      // Six amounts that must add up to `count`: a plain AndOptions would pick each one alone.
      const units = this.spreadUnits(input.count);
      const order: Array<keyof Units> = ['megacredits', 'steel', 'titanium', 'plants', 'energy', 'heat'];
      return {type: 'and', responses: order.map((k) => ({type: 'amount', amount: units[k]}))};
    }
    if (input instanceof AndOptions) {
      return {type: 'and', responses: input.options.map((o) => this.decide(o, player, attempt))};
    }
    if (input instanceof SelectInitialCards) {
      return {type: 'initialCards', responses: input.options.map((o) => this.decide(o, player, attempt))};
    }
    if (input instanceof SelectOption) {
      return {type: 'option'};
    }
    if (input instanceof SelectCardToPlay) {
      return this.decideCardToPlay(input, player, attempt);
    }
    if (input instanceof SelectCard) {
      return this.decideCard(input);
    }
    if (input instanceof SelectPayment) {
      const payment = autoPayment(player, input.amount, input.paymentOptions, input.reserveUnits, this.rng, attempt);
      if (payment === undefined) {
        throw new InputError('The bot cannot afford this payment');
      }
      return {type: 'payment', payment};
    }
    if (input instanceof SelectSpace) {
      return {type: 'space', spaceId: this.pick(input.spaces).id};
    }
    if (input instanceof SelectAmount) {
      const amount = input.maxByDefault === true && this.rng.next() < 0.5 ?
        input.max :
        input.min + this.rng.nextInt(input.max - input.min + 1);
      return {type: 'amount', amount};
    }
    if (input instanceof SelectResource) {
      return {type: 'resource', resource: this.pick(input.include)};
    }
    if (input instanceof SelectResources) {
      return {type: 'resources', units: this.spreadUnits(input.count)};
    }
    if (input instanceof SelectColony) {
      return {type: 'colony', colonyName: this.pick(input.colonies).name};
    }
    if (input instanceof SelectPlayer) {
      return {type: 'player', player: this.pick(input.players).color};
    }
    if (input instanceof SelectDelegate) {
      const delegate = this.pick(input.players);
      return {type: 'delegate', player: delegate === 'NEUTRAL' ? 'NEUTRAL' : delegate.color};
    }
    if (input instanceof SelectParty) {
      return {type: 'party', partyName: this.pick(input.parties)};
    }
    if (input instanceof SelectGlobalEvent) {
      return {type: 'globalEvent', globalEventName: this.pick(input.globalEvents).name};
    }
    if (input instanceof SelectProductionToLose) {
      return {type: 'productionToLose', units: this.productionToLose(input, player)};
    }
    if (input instanceof ShiftAresGlobalParameters) {
      return {type: 'aresGlobalParameters', response: this.aresShift()};
    }
    if (input instanceof SelectClaimedUndergroundToken) {
      const count = input.min + this.rng.nextInt(input.max - input.min + 1);
      return {type: 'claimedUndergroundToken', selected: this.sample(input.tokens.map((_, i) => i), count)};
    }
    if (input instanceof DeltaProjectInput) {
      return {type: 'deltaProject', amount: this.pick(input.validSteps)};
    }
    if (input instanceof SelectInfrastructure) {
      const stacks = HighOrbit.sectorsModel(player).flatMap((s) => s.stacks).filter((s) => s.disabledReason === undefined);
      return {type: 'infrastructure', card: this.pick(stacks).card};
    }
    throw new UnsupportedInputError(input);
  }

  private decideOr(input: OrOptions, player: IPlayer, attempt: number): InputResponse {
    const isActionMenu = input.options.some((o) => o instanceof SelectOption && o.title === 'Pass for this generation');
    // After a failed attempt, spread the picks out instead of repeating the favorite.
    const weights = input.options.map((option) => this.weight(option, isActionMenu, attempt));
    const total = weights.reduce((a, b) => a + b, 0);
    if (total <= 0) {
      throw new InputError('There is nothing the bot is willing to choose');
    }
    let r = this.rng.next() * total;
    let index = 0;
    for (; index < weights.length - 1; index++) {
      r -= weights[index];
      if (r < 0) {
        break;
      }
    }
    return {type: 'or', index, response: this.decide(input.options[index], player, attempt)};
  }

  private weight(option: PlayerInput, isActionMenu: boolean, attempt: number): number {
    if (option instanceof UndoActionOption) {
      return 0;
    }
    if (!isActionMenu) {
      return 1;
    }
    if (option instanceof SelectOption) {
      switch (option.title) {
      case 'Pass for this generation':
        // Passing a bit more with every retry, so a stuck menu eventually settles on it.
        return 0.6 + attempt * 0.5;
      case 'End Turn':
        return 0.3;
      }
      if (typeof option.title === 'string' && option.title.startsWith('Convert')) {
        return 3;
      }
    }
    return 1;
  }

  private decideCard(input: SelectCard<any>): InputResponse {
    const available: Array<string> = [];
    input.cards.forEach((card, i) => {
      if (input.config.enabled?.[i] !== false) {
        available.push(card.name);
      }
    });
    const max = Math.min(input.config.max, available.length);
    const min = Math.min(input.config.min, max);
    const count = min + this.rng.nextInt(max - min + 1);
    return {type: 'card', cards: this.sample(available, count) as Array<any>};
  }

  private decideCardToPlay(input: SelectCardToPlay<any>, player: IPlayer, attempt: number): InputResponse {
    const candidates = input.cards.filter((_, i) => input.enabled?.[i] !== false);
    if (candidates.length === 0) {
      throw new InputError('No card is playable');
    }
    const card = this.pick(candidates);
    const cost = input.toModel(player).cards.find((c) => c.name === card.name)?.calculatedCost ?? card.cost;
    const options = input instanceof SelectStandardProjectToPlay ?
      input.paymentRulesFor(card).paymentOptions :
      player.paymentOptionsForCard(card as IProjectCard);
    const reserve = input.extras.get(card.name)?.reserveUnits;
    const payment: Payment | undefined = autoPayment(player, cost, options, reserve, this.rng, attempt);
    if (payment === undefined) {
      throw new InputError(`The bot cannot afford ${card.name}`);
    }
    return {type: 'projectCard', card: card.name, payment};
  }

  private productionToLose(input: SelectProductionToLose, player: IPlayer): Units {
    const units: Units = {...Units.EMPTY};
    const canLose = (u: Units) => player.production.canAdjust(Units.negative(u));
    const keys = Units.keys;
    let steps = input.unitsToLose;
    // Pairs first: each must be 2 steps from one production.
    for (let pair = 0; pair < input.pairs && steps >= 2; pair++) {
      const options = keys.filter((k) => canLose({...units, [k]: units[k] + 2}));
      if (options.length === 0) {
        break;
      }
      units[this.pick(options)] += 2;
      steps -= 2;
    }
    while (steps > 0) {
      const options = keys.filter((k) => canLose({...units, [k]: units[k] + 1}));
      if (options.length === 0) {
        throw new InputError('The bot cannot lose that much production');
      }
      units[this.pick(options)] += 1;
      steps--;
    }
    return units;
  }

  private aresShift(): AresGlobalParametersResponse {
    const shift: AresGlobalParametersResponse = {lowOceanDelta: 0, highOceanDelta: 0, temperatureDelta: 0, oxygenDelta: 0};
    const keys = Object.keys(shift) as Array<keyof AresGlobalParametersResponse>;
    if (this.rng.next() < 0.7) {
      shift[this.pick(keys)] = this.rng.next() < 0.5 ? -1 : 1;
    }
    return shift;
  }

  private spreadUnits(count: number): Units {
    const units: Units = {...Units.EMPTY};
    for (let i = 0; i < count; i++) {
      units[this.pick(Units.keys)] += 1;
    }
    return units;
  }

  private pick<T>(items: ReadonlyArray<T>): T {
    if (items.length === 0) {
      throw new InputError('The bot has nothing to choose from');
    }
    return items[this.rng.nextInt(items.length)];
  }

  /** `count` distinct items, in random order. */
  private sample<T>(items: ReadonlyArray<T>, count: number): Array<T> {
    const pool = [...items];
    const result: Array<T> = [];
    while (result.length < count && pool.length > 0) {
      result.push(pool.splice(this.rng.nextInt(pool.length), 1)[0]);
    }
    return result;
  }
}
