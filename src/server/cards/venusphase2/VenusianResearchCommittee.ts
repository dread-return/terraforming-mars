import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';

export class VenusianResearchCommittee extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.AUTOMATED,
      name: CardName.VENUSIAN_RESEARCH_COMMITTEE,
      tags: [Tag.SCIENCE, Tag.VENUS],
      cost: 17,

      behavior: {
        drawCard: {count: {tag: Tag.VENUS, per: 2}},
        global: {venus: 1},
      },

      metadata: {
        cardNumber: 'V84',
        renderData: CardRenderer.builder((b) => {
          b.cards(1).slash().tag(Tag.VENUS, 2).nbsp.venus(1);
        }),
        description: 'Draw a card for every 2 Venus tags you have, including this. Raise Venus 1 step.',
      },
    });
  }
}
