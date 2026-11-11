import {IPlayer} from '../../IPlayer';
import {IProjectCard} from '../IProjectCard';
import {IPreludeCard} from '../prelude/IPreludeCard';
import {DrawCards, DrawOptions} from '../../deferredActions/DrawCards';
import {ChooseCards, LogType, keep} from '../../deferredActions/ChooseCards';
import {SelectCard} from '../../inputs/SelectCard';
import {SelectProjectCardToPlay} from '../../inputs/SelectProjectCardToPlay';
import {CardName} from '../../../common/cards/CardName';
import {inplaceRemove} from '../../../common/utils/utils';

/** Preludes that count as playing two preludes. Double Down cannot copy them. */
export const DOUBLE_PRELUDES: ReadonlySet<CardName> = new Set([
  CardName.DOME_VALLEY,
  CardName.HEAVY_MINER,
  CardName.MASSIVE_SHIPMENT,
  CardName.MENTAL_BREAKDOWN,
  CardName.NEBULA_ENERGY_FIELD_PORTAL,
  CardName.TERRA_MARS,
  CardName.WARP_GATE,
]);

/**
 * Preludes no effect may copy or replay (Double Down, Relativistic Reverberation, Cloned Workforce):
 * the double preludes, plus Merger (too strong to copy) and Delta Project (copying it does nothing).
 */
export const UNCOPYABLE_PRELUDES: ReadonlySet<CardName> = new Set([
  ...DOUBLE_PRELUDES,
  CardName.MERGER,
  CardName.DELTA_PROJECT,
]);

export class EternityUtils {
  /** Reveal-until draw (keeps every matching card), then run `cb` with the cards drawn. */
  /** Junk Ventures: shuffle the discard pile, reveal up to 3 cards from it, keep 1 and discard the rest. */
  public static junkVenturesDraw(player: IPlayer): void {
    const game = player.game;
    const deck = game.projectDeck;
    deck.shuffleDiscardPile();
    const cards: Array<IProjectCard> = [];
    for (let i = 0; i < 3; i++) {
      const card = deck.discardPile.pop();
      if (card === undefined) {
        break;
      }
      cards.push(card);
    }
    if (cards.length > 0) {
      game.defer(new ChooseCards(player, cards, {keepMax: 1}));
    }
  }
  public static drawThen(player: IPlayer, count: number, options: DrawOptions, cb: (cards: ReadonlyArray<IProjectCard>) => void): void {
    player.game.defer(new DrawCards(player, count, options).andThen((cards) => {
      keep(player, cards, [], LogType.DREW_VERBOSE);
      cb(cards);
    }));
  }

  /**
   * "Playing this card counts as playing 2 preludes. If you only have 1 play available and play this card,
   * instead discard it and play the top card of the prelude deck."
   */
  public static playDoublePrelude(player: IPlayer, card: IPreludeCard, effect: () => void): void {
    const game = player.game;
    const others = player.preludeCardsInHand.filter((c) => c !== card);
    if (others.length === 0) {
      game.log('${0} was ${1}\'s last prelude play, so it is discarded and the top prelude is played instead', (b) => b.card(card).player(player));
      player.defer(() => {
        player.playedCards.remove(card);
        game.preludeDeck.discard(card);
        const top = game.preludeDeck.draw(game);
        if (top !== undefined) {
          game.log('${0} played ${1} from the top of the prelude deck', (b) => b.player(player).card(top));
          player.playCard(top);
        }
        return undefined;
      });
      return;
    }
    effect();
    const discardOne = (c: IPreludeCard) => {
      inplaceRemove(player.preludeCardsInHand, c);
      game.preludeDeck.discard(c);
      game.log('${0} gave up ${1} for ${2}', (b) => b.player(player).card(c).card(card));
    };
    if (others.length === 1) {
      discardOne(others[0]);
    } else {
      player.defer(new SelectCard('Select the prelude you give up (this card counts as 2 preludes)', 'Discard', others).andThen(([c]) => {
        discardOne(c);
        return undefined;
      }));
    }
  }

  /**
   * Lets `player` pick (optionally) one of `source()` and play it for free, ignoring requirements.
   * `fromDiscard` removes it from the project discard pile first.
   */
  public static playFree(player: IPlayer, source: () => ReadonlyArray<IProjectCard>, title: string, fromDiscard: boolean): void {
    player.defer(() => {
      const playable = source().filter((c) => c.canPlayPostRequirements(player, {cost: 0}));
      if (playable.length === 0) {
        return undefined;
      }
      return new SelectCard(title, 'Play', playable, {min: 0, max: 1}).andThen(([card]) => {
        if (card === undefined) {
          return undefined;
        }
        if (fromDiscard) {
          inplaceRemove(player.game.projectDeck.discardPile, card);
        }
        player.playCard(card);
        return undefined;
      });
    });
  }

  /** Lets `player` play a card from hand matching `filter`, if any is playable. Never fizzles. */
  public static mayPlayFromHand(player: IPlayer, filter: (card: IProjectCard) => boolean): void {
    player.defer(() => {
      const playable = player.getPlayableCards().filter(filter);
      if (playable.length === 0) {
        player.lastCardPlayed = undefined;
        return undefined;
      }
      return new SelectProjectCardToPlay(player, playable);
    });
  }
}
