import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {Size} from '../../../common/cards/render/Size';
import {CardRenderer} from '../render/CardRenderer';
import {PartyName} from '../../../common/turmoil/PartyName';

/**
 * H47. Its tag is a wild tag. The printed "also in hand" (discounts and tag triggers) is not
 * modelled: wild tags work as they do on every other card.
 */
export class GreatMartianArchives extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.AUTOMATED,
      name: CardName.GREAT_MARTIAN_ARCHIVES,
      tags: [Tag.WILD],
      cost: 20,
      requirements: {party: PartyName.TRANSHUMANISTS},

      metadata: {
        cardNumber: 'H47',
        renderData: CardRenderer.builder((b) => {
          b.text('The wild tag counts as any tag.', {size: Size.SMALL, isBold: false});
        }),
        description: 'Requires that Transhumanists are ruling or that you have 2 delegates there.',
      },
    });
  }
}
