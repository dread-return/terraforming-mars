import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {IActionCard} from '../ICard';
import {InfrastructureCard} from './InfrastructureCard';

/** Action: take two other actions (like Martian Hour: two more actions this turn). */
export class AsteroidOutpost extends InfrastructureCard implements IActionCard {
  constructor(copy: number = 1) {
    super(CardName.ASTEROID_OUTPOST, copy, {
      victoryPoints: 1,
      metadata: {
        cardNumber: 'INF15',
        renderData: CardRenderer.builder((b) => {
          b.action('Take two other actions.', (eb) => eb.empty().startAction.text('2 actions'));
        }),
      },
    });
  }

  public canAct(): boolean {
    return true;
  }

  public action(player: IPlayer) {
    player.availableActionsThisRound += 2;
    player.game.log('${0} gets two more actions this turn (${1})', (b) => b.player(player).card(this));
    return undefined;
  }
}
