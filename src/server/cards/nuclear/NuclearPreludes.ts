import {IPlayer} from '../../IPlayer';
import {IProjectCard} from '../IProjectCard';
import {IPreludeCard} from '../prelude/IPreludeCard';
import {SelectProjectCardToPlay} from '../../inputs/SelectProjectCardToPlay';
import {PreludesExpansion} from '../../preludes/PreludesExpansion';

export class NuclearPreludes {
  /**
   * Lets `player` play one card from hand matching `filter`, with `prelude`'s discount
   * (applied through its getCardDiscount while it is the last card played).
   * The prelude fizzles when no such card can be played.
   */
  public static playDiscountedCard(player: IPlayer, prelude: IPreludeCard, filter: (card: IProjectCard) => boolean): void {
    player.defer(() => {
      const playable = player.getPlayableCards().filter((card) => filter(card));
      if (playable.length === 0) {
        PreludesExpansion.fizzle(player, prelude);
        player.lastCardPlayed = undefined;
        return undefined;
      }
      return new SelectProjectCardToPlay(player, playable);
    });
  }
}
