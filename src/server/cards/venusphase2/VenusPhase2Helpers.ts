import {IPlayer} from '../../IPlayer';
import {ICard} from '../ICard';
import {SelectColony} from '../../inputs/SelectColony';
import {ColoniesHandler} from '../../colonies/ColoniesHandler';

/**
 * Trade with a colony as a card action. Like Einstein-Rosen Gateway and Trade Agreements,
 * this uses up one of the player's trade fleets.
 */
export function tradeWithColony(player: IPlayer, card: ICard): SelectColony {
  return new SelectColony('Select a colony tile to trade with', 'Trade', ColoniesHandler.tradeableColonies(player.game))
    .andThen((colony) => {
      player.game.log('${0} used ${1} to trade with ${2}', (b) => b.player(player).card(card).colony(colony));
      colony.trade(player);
      return undefined;
    });
}
