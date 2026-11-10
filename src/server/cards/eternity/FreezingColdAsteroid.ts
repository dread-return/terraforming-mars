import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {CardType} from '../../../common/cards/CardType';
import {Card} from '../Card';
import {IProjectCard} from '../IProjectCard';
import {Tag} from '../../../common/cards/Tag';

export class FreezingColdAsteroid extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.EVENT,
      name: CardName.FREEZING_COLD_ASTEROID,
      tags: [Tag.SPACE, Tag.EVENT],
      cost: 33,
      behavior: {
        global: {temperature: 1},
        ocean: {count: 2},
        stock: {plants: 4},
      },
      metadata: {
        cardNumber: 'E72',
        renderData: CardRenderer.builder((b) => {
          b.temperature(1).oceans(2).plants(4);
        }),
        description: 'Raise the temperature 1 step. Place 2 oceans. Gain 4 plants.',
      },
    });
  }
}
