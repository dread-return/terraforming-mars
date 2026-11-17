import {CardName} from '../../../common/cards/CardName';
import {CardType} from '../../../common/cards/CardType';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {Card} from '../Card';
import {IProjectCard} from '../IProjectCard';
import {IPlayer} from '../../IPlayer';
import {Mercury} from '../../mercury/Mercury';

export class TheGiantSpiderSurvey extends Card implements IProjectCard {
  constructor() {
    super({
      name: CardName.THE_GIANT_SPIDER_SURVEY,
      type: CardType.EVENT,
      tags: [Tag.MERCURY],
      cost: 16,
      victoryPoints: 2,
      behavior: {
        drawCard: 2,
      },
      metadata: {
        cardNumber: 'MM06',
        renderData: CardRenderer.builder((b) => {
          b.asset(2).cards(2);
        }),
        description: 'Add 2 assets to an Act. Draw 2 cards.',
      },
    });
  }

  public override bespokePlay(player: IPlayer) {
    Mercury.gainAssets(player, 2);
    return undefined;
  }
}
