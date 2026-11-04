import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';

export class SMESTechnology extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.SMES_TECHNOLOGY,
      tags: [Tag.SCIENCE, Tag.POWER],
      cost: 5,
      requirements: {tag: Tag.SCIENCE},

      metadata: {
        cardNumber: 'H45',
        renderData: CardRenderer.builder((b) => {
          b.effect('During production, you may keep up to 3 energy instead of converting it to heat.', (eb) => {
            eb.energy(3).startEffect.text('keep');
          });
        }),
        description: 'Requires a science tag.',
      },
    });
  }
}
