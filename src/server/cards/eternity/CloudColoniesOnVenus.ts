import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {CardType} from '../../../common/cards/CardType';
import {Card} from '../Card';
import {IProjectCard} from '../IProjectCard';
import {Tag} from '../../../common/cards/Tag';

export class CloudColoniesOnVenus extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.AUTOMATED,
      name: CardName.CLOUD_COLONIES_ON_VENUS,
      tags: [Tag.VENUS],
      cost: 5,
      requirements: {venus: 4, max: true},
      behavior: {
        global: {venus: 1},
      },
      metadata: {
        cardNumber: 'E06',
        renderData: CardRenderer.builder((b) => {
          b.venus(1);
        }),
        description: 'Venus must be 4% or lower. Raise Venus 1 step.',
      },
    });
  }
}
