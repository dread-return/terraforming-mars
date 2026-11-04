import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';

export class ExcavationSyriaPlanum extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.EVENT,
      name: CardName.EXCAVATION_SYRIA_PLANUM,
      tags: [],
      cost: 5,

      metadata: {
        cardNumber: 'H17',
        renderData: CardRenderer.builder((b) => {
          b.text('next card: -2').tag(Tag.SCIENCE).text('required');
        }),
        description: 'The next card you play this generation has its science tag requirement reduced by 2.',
      },
    });
  }
}
