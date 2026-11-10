import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {CardType} from '../../../common/cards/CardType';
import {Card} from '../Card';
import {IProjectCard} from '../IProjectCard';
import {Tag} from '../../../common/cards/Tag';

export class MoholeDiscovery extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.AUTOMATED,
      name: CardName.MOHOLE_DISCOVERY,
      tags: [Tag.BUILDING],
      cost: 10,
      behavior: {
        production: {steel: 1, heat: 1},
      },
      metadata: {
        cardNumber: 'E92',
        renderData: CardRenderer.builder((b) => {
          b.production((pb) => pb.steel(1).heat(1));
        }),
        description: 'Increase your steel and heat production 1 step each.',
      },
    });
  }
}
