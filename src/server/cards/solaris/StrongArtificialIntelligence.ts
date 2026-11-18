import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';
import {PartyName} from '../../../common/turmoil/PartyName';

/**
 * S23. The text also says "increase your M€ production 1 step", but there is no production box on the
 * card, and misprints follow the icons (Leo, 2026-11-06): only the two wild tags.
 */
export class StrongArtificialIntelligence extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.AUTOMATED,
      name: CardName.STRONG_ARTIFICIAL_INTELLIGENCE,
      tags: [Tag.WILD, Tag.WILD],
      cost: 11,
      requirements: {party: PartyName.TRANSHUMANISTS},

      metadata: {
        cardNumber: 'S23',
        renderData: CardRenderer.builder((b) => {
          b.text('The wild tags count as any tags.', {size: Size.SMALL, isBold: false});
        }),
        description: 'Requires that Transhumanists are ruling or that you have 2 delegates there.',
      },
    });
  }
}
