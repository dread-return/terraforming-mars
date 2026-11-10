import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {CardType} from '../../../common/cards/CardType';
import {Card} from '../Card';
import {IProjectCard} from '../IProjectCard';
import {Tag} from '../../../common/cards/Tag';

export class OrbitalSpaceDebrisTether extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.AUTOMATED,
      name: CardName.ORBITAL_SPACE_DEBRIS_TETHER,
      tags: [Tag.EARTH, Tag.BUILDING, Tag.SPACE],
      cost: 12,
      requirements: {tag: Tag.SCIENCE, count: 2},
      victoryPoints: 2,
      behavior: {
        stock: {megacredits: 3},
        drawCard: 1,
      },
      metadata: {
        cardNumber: 'E96',
        renderData: CardRenderer.builder((b) => {
          b.megacredits(3).cards(1);
        }),
        description: 'Requires 2 science tags. Gain 3 M\u20ac. Draw a card.',
      },
    });
  }
}
