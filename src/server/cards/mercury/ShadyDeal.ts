import {CardName} from '../../../common/cards/CardName';
import {CardType} from '../../../common/cards/CardType';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {Card} from '../Card';
import {IProjectCard} from '../IProjectCard';
import {IPlayer} from '../../IPlayer';
import {Mercury} from '../../mercury/Mercury';

export class ShadyDeal extends Card implements IProjectCard {
  constructor() {
    super({
      name: CardName.SHADY_DEAL,
      type: CardType.EVENT,
      tags: [Tag.MERCURY],
      cost: 0,
      victoryPoints: -1,
      metadata: {
        cardNumber: 'MM22',
        renderData: CardRenderer.builder((b) => {
          b.asset(4).asterix();
        }),
        description: 'Add 4 assets to ANY Act.',
      },
    });
  }

  public override bespokePlay(player: IPlayer) {
    Mercury.gainAssets(player, 4, {anyAct: true});
    return undefined;
  }
}
