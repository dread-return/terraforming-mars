import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';

export class GreatFaceOfCydonia extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.GREAT_FACE_OF_CYDONIA,
      tags: [Tag.MARS, Tag.SCIENCE],
      cost: 10,
      requirements: {tag: Tag.SCIENCE, count: 3},

      metadata: {
        cardNumber: 'H27',
        renderData: CardRenderer.builder((b) => {
          b.effect('During the research phase, draw one card more than usual. In the first draft round, keep up to 2 cards.', (eb) => {
            eb.empty().startEffect.plus().cards(1).asterix();
          });
        }),
        description: 'Requires 3 science tags.',
      },
    });
  }
}
