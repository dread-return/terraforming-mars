import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';

export class GalileoInstitute extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.GALILEO_INSTITUTE,
      tags: [Tag.JOVIAN],
      cost: 21,
      requirements: {tag: Tag.SCIENCE},
      victoryPoints: 2,

      metadata: {
        cardNumber: 'I67',
        renderData: CardRenderer.builder((b) => {
          b.effect('Your Jovian tags count as science tags (but not the other way round).', (eb) => {
            eb.tag(Tag.JOVIAN).startEffect.tag(Tag.SCIENCE);
          });
        }),
        description: 'Requires a science tag.',
      },
    });
  }
}
