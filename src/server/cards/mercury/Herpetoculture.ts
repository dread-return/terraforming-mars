import {CardName} from '../../../common/cards/CardName';
import {CardType} from '../../../common/cards/CardType';
import {Tag} from '../../../common/cards/Tag';
import {CardResource} from '../../../common/CardResource';
import {CardRenderer} from '../render/CardRenderer';
import {Card} from '../Card';
import {IProjectCard} from '../IProjectCard';
import {IPlayer} from '../../IPlayer';
import {Mercury} from '../../mercury/Mercury';

export class Herpetoculture extends Card implements IProjectCard {
  constructor() {
    super({
      name: CardName.HERPETOCULTURE,
      type: CardType.AUTOMATED,
      tags: [Tag.ANIMAL, Tag.VENUS, Tag.MERCURY],
      cost: 12,
      behavior: {
        production: {heat: -2},
        addResourcesToAnyCard: {type: CardResource.ANIMAL, count: 3},
      },
      metadata: {
        cardNumber: 'MM11',
        renderData: CardRenderer.builder((b) => {
          b.production((pb) => pb.minus().heat(2)).resource(CardResource.ANIMAL, 3).asterix().asset(1);
        }),
        description: 'Decrease your heat production 2 steps. Add 3 animals to any card. Add 1 asset to an Act.',
      },
    });
  }

  public override bespokePlay(player: IPlayer) {
    Mercury.gainAssets(player, 1);
    return undefined;
  }
}
