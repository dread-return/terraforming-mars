import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';
import {PartyName} from '../../../common/turmoil/PartyName';

/** S13. The discount is applied in TagCardRequirement. */
export class BionicAugmentations extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.BIONIC_AUGMENTATIONS,
      tags: [Tag.SCIENCE],
      cost: 6,
      requirements: {party: PartyName.TRANSHUMANISTS},

      metadata: {
        cardNumber: 'S13',
        renderData: CardRenderer.builder((b) => {
          b.effect('Cards with science tag requirements need 2 fewer science tags for you.', (eb) => {
            eb.tag(Tag.SCIENCE).startEffect.text('-2', {size: Size.LARGE}).asterix();
          });
        }),
        description: 'Requires that Transhumanists are ruling or that you have 2 delegates there.',
      },
    });
  }
}
