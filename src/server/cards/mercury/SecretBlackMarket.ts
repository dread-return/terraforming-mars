import {CardName} from '../../../common/cards/CardName';
import {CardType} from '../../../common/cards/CardType';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {Card} from '../Card';
import {IProjectCard} from '../IProjectCard';
import {IPlayer} from '../../IPlayer';
import {Mercury} from '../../mercury/Mercury';

export class SecretBlackMarket extends Card implements IProjectCard {
  constructor() {
    super({
      name: CardName.SECRET_BLACK_MARKET,
      type: CardType.EVENT,
      tags: [Tag.SPACE],
      cost: 15,
      behavior: {
        colonies: {buildColony: {allowDuplicates: true}},
      },
      metadata: {
        cardNumber: 'MM40',
        renderData: CardRenderer.builder((b) => {
          b.colonies(1).asterix().asset(3);
        }),
        description: 'Place a colony (it may be placed where you already have a colony). Add 3 assets to an Act.',
      },
    });
  }

  public override bespokePlay(player: IPlayer) {
    Mercury.gainAssets(player, 3);
    return undefined;
  }
}
