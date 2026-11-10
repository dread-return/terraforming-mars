import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {CardType} from '../../../common/cards/CardType';
import {Card} from '../Card';
import {IProjectCard} from '../IProjectCard';
import {Tag} from '../../../common/cards/Tag';

export class FirstLaunch extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.AUTOMATED,
      name: CardName.FIRST_LAUNCH,
      tags: [Tag.EARTH],
      cost: 2,
      requirements: {tag: Tag.MARS, count: 1, max: true},
      behavior: {
        stock: {megacredits: 3},
        drawCard: 1,
      },
      metadata: {
        cardNumber: 'E69',
        renderData: CardRenderer.builder((b) => {
          b.megacredits(3).cards(1);
        }),
        description: 'You may have at most 1 Mars tag. Gain 3 M\u20ac and draw a card.',
      },
    });
  }
}
