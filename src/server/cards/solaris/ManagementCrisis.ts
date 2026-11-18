import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';
import {PartyName} from '../../../common/turmoil/PartyName';
import {IPlayer} from '../../IPlayer';

/** S29. The limit itself is in Eternity.actionsPerTurn. */
export class ManagementCrisis extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.EVENT,
      name: CardName.MANAGEMENT_CRISIS,
      tags: [],
      cost: 1,
      victoryPoints: -1,
      requirements: {party: PartyName.BUREAUCRATS},

      metadata: {
        cardNumber: 'S29',
        renderData: CardRenderer.builder((b) => {
          b.text('For the rest of this generation, your opponents take only 1 action per turn.', {size: Size.SMALL, isBold: false});
        }),
        description: 'Requires that Bureaucrats are ruling or that you have 2 delegates there.',
      },
    });
  }

  public generationUsed: number | undefined = undefined;

  public override bespokePlay(player: IPlayer) {
    this.generationUsed = player.game.generation;
    for (const opponent of player.opponents) {
      opponent.availableActionsThisRound = Math.min(opponent.availableActionsThisRound, 1);
    }
    player.game.log('For the rest of generation /bin/bash, \'s opponents take only 1 action per turn',
      (b) => b.number(player.game.generation).player(player));
    return undefined;
  }
}
