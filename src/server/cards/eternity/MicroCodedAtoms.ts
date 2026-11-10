import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {CardType} from '../../../common/cards/CardType';
import {Card} from '../Card';
import {IProjectCard} from '../IProjectCard';
import {Tag} from '../../../common/cards/Tag';

export class MicroCodedAtoms extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.AUTOMATED,
      name: CardName.MICRO_CODED_ATOMS,
      tags: [Tag.SCIENCE, Tag.MICROBE],
      cost: 10,
      requirements: [{tag: Tag.SCIENCE, count: 5}, {tag: Tag.MICROBE, count: 5}],
      victoryPoints: 1,
      behavior: {
        greenery: {},
        tr: 1,
      },
      metadata: {
        cardNumber: 'E88',
        renderData: CardRenderer.builder((b) => {
          b.greenery().tr(1);
        }),
        description: 'Requires 5 science tags and 5 microbe tags. Place a greenery. Raise your TR 1 step.',
      },
    });
  }
}
