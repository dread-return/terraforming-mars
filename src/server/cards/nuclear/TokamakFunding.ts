import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';

export class TokamakFunding extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.EVENT,
      name: CardName.TOKAMAK_FUNDING,
      tags: [Tag.SCIENCE, Tag.SPACE],
      cost: 5,
      behavior: {drawCard: {count: 3, keep: 2}},

      metadata: {
        cardNumber: 'N38',
        renderData: CardRenderer.builder((b) => {
          b.text('Look at the top 3 cards of the deck. Add 2 to your hand and discard the rest.');
        }),
      },
    });
  }
}
