import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {CardResource} from '../../../common/CardResource';

export class Bioreactors extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.BIOREACTORS,
      tags: [Tag.MICROBE],
      cost: 19,
      requirements: {tag: Tag.SCIENCE, count: 2},
      victoryPoints: 1,

      metadata: {
        cardNumber: 'H36',
        renderData: CardRenderer.builder((b) => {
          b.effect('Whenever you add microbes to a card, add 1 more.', (eb) => {
            eb.resource(CardResource.MICROBE).startEffect.text('+1');
          });
        }),
        description: 'Requires 2 science tags.',
      },
    });
  }
}
