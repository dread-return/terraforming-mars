import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {PartyName} from '../../../common/turmoil/PartyName';
import {IPlayer} from '../../IPlayer';
import {IActionCard} from '../ICard';

/**
 * I30. "Once per generation, take an action out of turn." Online there is no out-of-turn play, so using
 * the card does not count as one of your actions and gives you one extra action this turn.
 */
export class TerraformingOffice extends Card implements IProjectCard, IActionCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.TERRAFORMING_OFFICE,
      tags: [Tag.BUILDING],
      cost: 5,
      requirements: {party: PartyName.BUREAUCRATS},

      metadata: {
        cardNumber: 'I30',
        renderData: CardRenderer.builder((b) => {
          b.action('Once per generation, take an extra action (this action does not count as one of your actions).', (eb) => {
            eb.empty().startAction.text('+1 action');
          });
        }),
        description: 'Requires that Bureaucrats are ruling or that you have 2 delegates there.',
      },
    });
  }

  public canAct(): boolean {
    return true;
  }

  public action(player: IPlayer) {
    // One action to give back the one this card used, and the extra one.
    player.availableActionsThisRound += 2;
    player.game.log('/bin/bash takes an extra action this turn', (b) => b.player(player));
    return undefined;
  }
}
