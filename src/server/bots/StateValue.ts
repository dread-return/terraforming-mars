import {CardType} from '../../common/cards/CardType';
import * as constants from '../../common/constants';
import {IGame} from '../IGame';
import {IPlayer} from '../IPlayer';
import {calculateVictoryPoints} from '../game/calculateVictoryPoints';

/**
 * How much a position is worth to one player, in M€. The medium bot compares the value before and after each option
 * it could take, and takes the one that gains the most.
 *
 * It is a rough guide, not a solver. What it tries to get right:
 *  - production is worth its output times the generations left, so early production beats late production;
 *  - TR and VP are worth more as the game nears its end, and income per TR is worth less;
 *  - a resource is worth about what it converts into (8 heat -> a TR, 8 plants -> a greenery);
 *  - cards are worth what they cost to buy, and a played card is worth part of its cost whether or not its effect shows
 *    up anywhere else (blue-card actions and effects do not).
 */

/** Tunable numbers, in one place so a tuning run can change them. */
export const WEIGHTS = {
  /** M€ per VP at the start of the game and at the end. */
  vpEarly: 2.5,
  vpLate: 5,
  /** Typical number of generations in a game, for estimating how many are left. */
  typicalLength: 9,
  megacreditProduction: 1,
  steelProduction: 1.7,
  titaniumProduction: 2.6,
  plantProduction: 1.8,
  energyProduction: 1.2,
  heatProduction: 0.9,
  steel: 1.6,
  titanium: 2.4,
  energy: 0.6,
  /** A card in hand costs 3 M€ to buy, and is worth a little more than that to play. */
  cardInHand: 3.4,
  cardResource: 1.2,
  /** Share of a played card's cost that counts as its value when nothing else shows it. */
  automatedCardShare: 0.3,
  activeCardShare: 0.6,
  /** Opponents' gains count against the player at this rate. */
  opponent: 0.2,
};

/** Generations still to play, estimated from how far terraforming has got. 1 means this is probably the last. */
export function generationsLeft(game: IGame): number {
  const max = game.max;
  const oxygen = game.getOxygenLevel() / max.oxygen;
  const temperature = (game.getTemperature() - constants.MIN_TEMPERATURE) / (max.temperature - constants.MIN_TEMPERATURE);
  const oceans = game.board.getOceanSpaces().length / max.oceans;
  const progress = Math.min(1, (oxygen + temperature + oceans) / 3);
  return Math.max(1, Math.round(WEIGHTS.typicalLength * (1 - progress)) + 1);
}

function vpValue(left: number): number {
  const t = 1 - Math.min(left, WEIGHTS.typicalLength) / WEIGHTS.typicalLength;
  return WEIGHTS.vpEarly + (WEIGHTS.vpLate - WEIGHTS.vpEarly) * t;
}

/** What `player` has, in M€. */
export function playerValue(game: IGame, player: IPlayer, left: number = generationsLeft(game)): number {
  const vp = vpValue(left);
  // Production only pays out for the generations that remain, and not at all after the last production phase.
  const turns = Math.max(0, left - 1) + 0.5;
  const p = player.production;
  let value = 0;

  value += p.megacredits * WEIGHTS.megacreditProduction * turns;
  value += p.steel * WEIGHTS.steelProduction * turns;
  value += p.titanium * WEIGHTS.titaniumProduction * turns;
  value += p.plants * WEIGHTS.plantProduction * Math.min(turns, 6);
  value += p.energy * WEIGHTS.energyProduction * turns;
  value += p.heat * WEIGHTS.heatProduction * turns;

  // Heat converts at 8 for a TR, plants at 8 for a greenery (a TR through oxygen, plus a tile).
  const trWorth = vp + left;
  value += player.megaCredits;
  value += player.steel * WEIGHTS.steel;
  value += player.titanium * WEIGHTS.titanium;
  value += player.energy * WEIGHTS.energy;
  value += player.heat * 0.85 * trWorth / 8;
  value += player.plants * 0.85 * (trWorth + vp) / 8;

  value += player.cardsInHand.length * WEIGHTS.cardInHand;

  for (const card of player.tableau) {
    value += (card.resourceCount ?? 0) * WEIGHTS.cardResource;
    if (card.type === CardType.CORPORATION || card.type === CardType.PRELUDE || card.type === CardType.CEO) {
      continue;
    }
    if (card.type === CardType.EVENT) {
      continue;
    }
    const share = card.type === CardType.ACTIVE ? WEIGHTS.activeCardShare : WEIGHTS.automatedCardShare;
    value += (card.cost ?? 0) * share;
  }

  // All victory points: tiles, cards, milestones, awards, and the TR point.
  value += calculateVictoryPoints(player).total * vp;
  // Income from TR.
  value += player.terraformRating * left;
  return value;
}

/**
 * The gain for `player` of going from one position to another, as the sum over players. The player's own change counts
 * fully, the others' counts against it.
 */
export function relativeValue(game: IGame, player: IPlayer): number {
  const left = generationsLeft(game);
  let others = 0;
  for (const other of game.players) {
    if (other !== player) {
      others += playerValue(game, other, left);
    }
  }
  return playerValue(game, player, left) - WEIGHTS.opponent * others;
}
