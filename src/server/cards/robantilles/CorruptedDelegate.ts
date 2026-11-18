import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Size} from '../../../common/cards/render/Size';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {PartyName} from '../../../common/turmoil/PartyName';

/** H10. */
export class CorruptedDelegate extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.EVENT,
      name: CardName.CORRUPTED_DELEGATE,
      tags: [],
      cost: 0,
      requirements: {party: PartyName.BUREAUCRATS},

      metadata: {
        cardNumber: 'H10',
        renderData: CardRenderer.builder((b) => {
          b.text('+3 actions', {size: Size.LARGE}).asterix();
        }),
        description: 'Requires that Bureaucrats are ruling or that you have 2 delegates there. Take 3 more actions immediately.',
      },
    });
  }

  public override bespokePlay(player: IPlayer) {
    player.availableActionsThisRound += 3;
    return undefined;
  }
}
