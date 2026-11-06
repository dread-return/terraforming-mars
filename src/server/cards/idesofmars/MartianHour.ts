import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {Size} from '../../../common/cards/render/Size';

export class MartianHour extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.EVENT,
      name: CardName.MARTIAN_HOUR,
      cost: 0,

      metadata: {
        cardNumber: 'I12',
        renderData: CardRenderer.builder((b) => {
          b.text('Immediately take two more actions.', {size: Size.MEDIUM, uppercase: true});
        }),
      },
    });
  }

  public override bespokePlay(player: IPlayer) {
    player.availableActionsThisRound += 2;
    return undefined;
  }
}
