import {CardName} from '../cards/CardName';

/**
 * Act cards that are built but kept out of the Act deck for now: they share something between two players
 * (corporation effects, a blue card, a city) in ways the game has no support for yet.
 */
export const HELD_OUT_ACTS: ReadonlySet<CardName> = new Set([
  CardName.CORPORATE_COALITION,
  CardName.OUTSOURCING,
  CardName.SHARED_CITY,
]);
