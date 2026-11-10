import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {CardType} from '../../../common/cards/CardType';
import {Card} from '../Card';
import {IPlayer} from '../../IPlayer';
import {IProjectCard} from '../IProjectCard';
import {Resource} from '../../../common/Resource';
import {Tag} from '../../../common/cards/Tag';

export class TheHeartOfTheSwan extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.AUTOMATED,
      name: CardName.THE_HEART_OF_THE_SWAN,
      tags: [Tag.EARTH],
      cost: 4,
      behavior: {
        production: {megacredits: 1},
        drawCard: 1,
      },
      metadata: {
        cardNumber: 'E131',
        renderData: CardRenderer.builder((b) => {
          b.production((pb) => pb.megacredits(1)).cards(1).br.tag(Tag.SPACE).tag(Tag.SPACE).colon().megacredits(3);
        }),
        description: 'Increase your M\u20ac production 1 step and draw a card. If you have 2 space tags, also gain 3 M\u20ac.',
      },
    });
  }

  public override bespokePlay(player: IPlayer) {
    if (player.tags.count(Tag.SPACE) >= 2) {
      player.stock.add(Resource.MEGACREDITS, 3, {log: true});
    }
    return undefined;
  }
}
