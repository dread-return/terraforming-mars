import {CardName} from '../cards/CardName';

/**
 * Act cards that are built but kept out of the Act deck for now: they share a corporation's effects or a blue card
 * between two players, which the game has no support for. (Shared City, which shares a city tile, is in the deck
 * since 2026-11-27.)
 */
export const HELD_OUT_ACTS: ReadonlySet<CardName> = new Set([
  CardName.CORPORATE_COALITION,
  CardName.OUTSOURCING,
]);
