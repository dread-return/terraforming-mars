import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {LogHelper} from '../../LogHelper';

export class InterplanetaryRoutes extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.AUTOMATED,
      name: CardName.INTERPLANETARY_ROUTES,
      tags: [Tag.JOVIAN],
      cost: 10,
      victoryPoints: 1,

      metadata: {
        cardNumber: 'V70',
        renderData: CardRenderer.builder((b) => {
          b.colonyTile().text('+1').asterix();
        }),
        description: 'Move the colony track marker up 1 step on every colony tile where you have a colony.',
      },
    });
  }

  public override bespokePlay(player: IPlayer) {
    for (const colony of player.game.colonies) {
      if (colony.colonies.includes(player.id)) {
        colony.increaseTrack(1);
        LogHelper.logColonyTrackIncrease(player, colony, 1);
      }
    }
    return undefined;
  }
}
