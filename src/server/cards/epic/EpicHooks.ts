import {CardName} from '../../../common/cards/CardName';
import {CardType} from '../../../common/cards/CardType';
import {GlobalParameter} from '../../../common/GlobalParameter';
import {Resource} from '../../../common/Resource';
import {IPlayer} from '../../IPlayer';
import {ICard} from '../ICard';

/**
 * Engine hooks for the Epic Corporations (part of Corporate Era in this fork).
 *
 * Each hook only does something when a player has the matching corporation,
 * so they are cheap no-ops otherwise.
 */
export class EpicHooks {
  /** Called whenever a player raises a global parameter during the action phase. */
  public static onGlobalParameterIncrease(activePlayer: IPlayer, parameter: GlobalParameter, steps: number): void {
    if (steps <= 0 || activePlayer.game === undefined) {
      return;
    }
    for (const p of activePlayer.game.players) {
      // Barsoomian Atmospherics: 2 M€ per oxygen step raised by anyone, plus 2 energy when it's you.
      if (parameter === GlobalParameter.OXYGEN && p.tableau.has(CardName.BARSOOMIAN_ATMOSPHERICS)) {
        p.stock.add(Resource.MEGACREDITS, 2 * steps, {log: true});
        if (p.id === activePlayer.id) {
          p.stock.add(Resource.ENERGY, 2 * steps, {log: true});
        }
      }
      // Planetary Homeostasis Bureau: +1 M€ production per temperature step raised by anyone.
      if (parameter === GlobalParameter.TEMPERATURE && p.tableau.has(CardName.PLANETARY_HOMEOSTASIS_BUREAU)) {
        p.production.add(Resource.MEGACREDITS, steps, {log: true});
      }
    }
  }

  /** Called when a player uses the action on a card in their tableau. */
  public static onCardAction(player: IPlayer, card: ICard): void {
    // M.A.R.S.: 1 M€ each time you use the action of a blue card.
    if (card.type === CardType.ACTIVE && player.tableau.has(CardName.MARS_ACTIVE_RESOURCES)) {
      player.stock.add(Resource.MEGACREDITS, 1, {log: true});
    }
  }

  /** Extra cards to look at during the research phase (Leviathan). */
  public static extraResearchCards(player: IPlayer): number {
    return player.tableau.has(CardName.LEVIATHAN) ? 1 : 0;
  }
}
