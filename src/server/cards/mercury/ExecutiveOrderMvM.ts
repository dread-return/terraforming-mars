import {CardName} from '../../../common/cards/CardName';
import {CardType} from '../../../common/cards/CardType';
import {Size} from '../../../common/cards/render/Size';
import {CardRenderer} from '../render/CardRenderer';
import {Card} from '../Card';
import {IProjectCard} from '../IProjectCard';
import {IPlayer} from '../../IPlayer';
import {Mercury} from '../../mercury/Mercury';

export class ExecutiveOrderMvM extends Card implements IProjectCard {
  constructor() {
    super({
      name: CardName.EXECUTIVE_ORDER_MVM,
      type: CardType.EVENT,
      cost: 3,
      requirements: {chairman: true},
      metadata: {
        cardNumber: 'MM17',
        renderData: CardRenderer.builder((b) => {
          b.text('resolve', {size: Size.SMALL}).actCard(1).asterix();
        }),
        description: 'Requires that you are Chairman. Immediately resolve ANY Act in development. (A Rivalry goes to the player closer to their handshake.)',
      },
    });
  }

  public override bespokePlay(player: IPlayer) {
    return Mercury.selectAnyDevelopment(player, 'Select an Act to resolve now', (dev) => Mercury.resolveNow(player.game, dev));
  }
}
