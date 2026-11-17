import {CardName} from '../../../common/cards/CardName';
import {CardType} from '../../../common/cards/CardType';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {Card} from '../Card';
import {IProjectCard} from '../IProjectCard';
import {IPlayer} from '../../IPlayer';
import {Mercury} from '../../mercury/Mercury';

export class DefenceFleet extends Card implements IProjectCard {
  constructor() {
    super({
      name: CardName.DEFENCE_FLEET,
      type: CardType.AUTOMATED,
      tags: [Tag.SPACE],
      cost: 16,
      victoryPoints: 2,
      metadata: {
        cardNumber: 'MM39',
        renderData: CardRenderer.builder((b) => {
          b.asset(3);
        }),
        description: 'Add 3 assets to an Act.',
      },
    });
  }

  public override bespokePlay(player: IPlayer) {
    Mercury.gainAssets(player, 3);
    return undefined;
  }
}
