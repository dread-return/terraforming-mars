import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {all, digit} from '../Options';

export class ColdFusionReactor extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.AUTOMATED,
      name: CardName.COLD_FUSION_REACTOR,
      tags: [Tag.RADIOACTIVE, Tag.SCIENCE, Tag.POWER],
      cost: 23,
      requirements: {tag: Tag.RADIOACTIVE, count: 6, all},
      behavior: {
        production: {energy: 5},
        tr: 2,
      },

      metadata: {
        cardNumber: 'N15',
        renderData: CardRenderer.builder((b) => {
          b.production((pb) => pb.energy(5, {digit})).nbsp.tr(2);
        }),
        description: 'Requires 6 radioactive tags in play. Increase your energy production 5 steps. Raise your TR 2 steps.',
      },
    });
  }
}
