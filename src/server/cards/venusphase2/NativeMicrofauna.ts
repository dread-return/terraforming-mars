import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardResource} from '../../../common/CardResource';
import {CardRenderer} from '../render/CardRenderer';

export class NativeMicrofauna extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.AUTOMATED,
      name: CardName.NATIVE_MICROFAUNA,
      tags: [Tag.MICROBE, Tag.VENUS],
      cost: 11,
      victoryPoints: 2,
      requirements: {venus: 16, max: true},

      behavior: {
        addResourcesToAnyCard: {count: 2, type: CardResource.MICROBE},
      },

      metadata: {
        cardNumber: 'V65',
        renderData: CardRenderer.builder((b) => {
          b.resource(CardResource.MICROBE, 2).asterix();
        }),
        description: 'Venus must be 16% or lower. Add 2 microbes to any card.',
      },
    });
  }
}
