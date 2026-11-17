import {CardName} from '../../common/cards/CardName';
import {Random} from '../../common/utils/Random';
import {Deck} from '../cards/Deck';
import {SerializedDeck} from '../cards/SerializedDeck';
import {cardsFromJSON} from '../createCard';
import {IActCard, isActCard} from './ActCard';
import {ActDevelopment, MercuryState, SerializedMercury} from './Mercury';

/**
 * The deck of Act cards, and restoring the Mercury state from a saved game.
 *
 * Kept apart from Mercury.ts: Mercury.ts is imported by low-level code (AddResourcesToCard), and creating cards
 * there would make an import cycle.
 */
export class ActDeck extends Deck<IActCard> {
  public constructor(deck: Array<IActCard>, discarded: Array<IActCard>, random: Random) {
    super('act', deck, discarded, random);
  }

  public static deserialize(d: SerializedDeck, random: Random): ActDeck {
    const toActs = (names: ReadonlyArray<CardName>) => cardsFromJSON(names).filter(isActCard);
    return new ActDeck(toActs(d.drawPile), toActs(d.discardPile), random);
  }
}

export function deserializeMercury(d: SerializedMercury, rng: Random): MercuryState {
  const developments: Array<ActDevelopment> = [];
  for (const dev of d.developments) {
    const card = cardsFromJSON([dev.card]).find(isActCard);
    if (card !== undefined) {
      developments.push({card, initiator: dev.initiator, partner: dev.partner, progress: [dev.progress[0], dev.progress[1]]});
    }
  }
  return {
    actDeck: ActDeck.deserialize(d.actDeck, rng),
    developments,
    track: d.track,
    market: {microbe: d.market.microbe ?? 0, floater: d.market.floater ?? 0, data: d.market.data ?? 0, other: [...(d.market.other ?? [])]},
    negotiated: [...(d.negotiated ?? [])],
    plantShares: (d.plantShares ?? []).map((s) => ({...s})),
    fleetLoans: (d.fleetLoans ?? []).map((l) => ({...l})),
  };
}
