import {IPlayer} from '../../../IPlayer';
import {IGlobalEvent} from '../../globalEvents/IGlobalEvent';
import {Turmoil} from '../../Turmoil';
import {Resource} from '../../../../common/Resource';
import {Tag} from '../../../../common/cards/Tag';
import {CardType} from '../../../../common/cards/CardType';
import {PLANETARY_TAGS} from '../../../pathfinders/PathfindersData';
import {OrOptions} from '../../../inputs/OrOptions';
import {SelectOption} from '../../../inputs/SelectOption';
import {SelectAmount} from '../../../inputs/SelectAmount';
import {message} from '../../../logs/MessageBuilder';
import {PlayerInput} from '../../../PlayerInput';
import {Priority} from '../../../deferredActions/Priority';
import {SimpleDeferredAction} from '../../../deferredActions/DeferredAction';

/** The influence the player has in Turmoil. */
export function influenceOf(player: IPlayer): number {
  return Turmoil.getTurmoil(player.game).getInfluence(player);
}

/** City tiles the player owns, anywhere on the board. */
export function citiesOf(player: IPlayer): number {
  return player.game.board.getCities(player).length;
}

/** Tags the player has, as counted by global events (wild tags do not apply, like the other global events). */
export function tagsOf(player: IPlayer, tag: Tag): number {
  return player.tags.count(tag, 'raw');
}

/** All the planet tags: Venus, Earth, Mars, Jovian, Moon and Mercury. */
export function planetTagsOf(player: IPlayer): number {
  return [...PLANETARY_TAGS, Tag.MERCURY].reduce((sum, tag) => sum + tagsOf(player, tag), 0);
}

/** Number of sets of 5 TR over 15, at most 5. */
export function setsOfTrOverFifteen(player: IPlayer): number {
  return Math.min(5, Math.max(0, Math.floor((player.terraformRating - 15) / 5)));
}

export function automatedCardsOf(player: IPlayer): number {
  return player.playedCards.filter((card) => card.type === CardType.AUTOMATED).length;
}

export function gain(player: IPlayer, resource: Resource, amount: number, event: IGlobalEvent): void {
  if (amount > 0) {
    player.stock.add(resource, amount, {log: true, from: {globalEvent: event}});
  }
}

/** Loses `amount` of `resource`, or as much as the player has. */
export function lose(player: IPlayer, resource: Resource, amount: number, event: IGlobalEvent): void {
  if (amount > 0) {
    player.stock.add(resource, -amount, {log: true, from: {globalEvent: event}});
  }
}

/** Runs `fn` after the choices the event has already asked for. */
export function deferLast(player: IPlayer, fn: () => PlayerInput | undefined): void {
  player.game.defer(new SimpleDeferredAction(player, fn, Priority.BACK_OF_THE_LINE));
}

export type Choice = {title: string, apply: () => void};

/** Asks the player to pick one of `choices`. A single choice is applied directly, none does nothing. */
export function chooseOne(player: IPlayer, title: string, choices: ReadonlyArray<Choice>): void {
  if (choices.length === 0) {
    return;
  }
  if (choices.length === 1) {
    choices[0].apply();
    return;
  }
  const options = new OrOptions(...choices.map((choice) => new SelectOption(choice.title).andThen(() => {
    choice.apply();
    return undefined;
  })));
  options.setTitle(title);
  player.defer(options);
}

/** "Ore" is steel or titanium. The player picks which one to gain. */
export function gainOre(player: IPlayer, amount: number, event: IGlobalEvent): void {
  if (amount <= 0) {
    return;
  }
  chooseOne(player, 'Select which ore to gain', [
    {title: `Gain ${amount} steel`, apply: () => gain(player, Resource.STEEL, amount, event)},
    {title: `Gain ${amount} titanium`, apply: () => gain(player, Resource.TITANIUM, amount, event)},
  ]);
}

/** "Ore" is steel or titanium. The player picks how to split the loss between them. */
export function loseOre(player: IPlayer, amount: number, event: IGlobalEvent): void {
  const total = Math.min(amount, player.steel + player.titanium);
  if (total <= 0) {
    return;
  }
  const minSteel = Math.max(0, total - player.titanium);
  const maxSteel = Math.min(total, player.steel);
  const apply = (steel: number) => {
    lose(player, Resource.STEEL, steel, event);
    lose(player, Resource.TITANIUM, total - steel, event);
  };
  if (minSteel === maxSteel) {
    apply(minSteel);
    return;
  }
  player.defer(new SelectAmount(
    message('Select how much of the ${0} ore you lose is steel (the rest is titanium)', (b) => b.number(total)),
    'Lose', minSteel, maxSteel, true)
    .andThen((steel) => {
      apply(steel);
      return undefined;
    }));
}

/** The players with the highest `score`, if it is at least `min`. */
export function highestScorers(players: ReadonlyArray<IPlayer>, score: (player: IPlayer) => number, min: number = 1): Array<IPlayer> {
  const best = Math.max(...players.map(score));
  return best >= min ? players.filter((player) => score(player) === best) : [];
}

export function draw(player: IPlayer, amount: number): void {
  if (amount > 0) {
    player.drawCard(amount);
  }
}
