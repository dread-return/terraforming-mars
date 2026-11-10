import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {CardType} from '../../../common/cards/CardType';
import {Card} from '../Card';
import {IProjectCard} from '../IProjectCard';
import {Tag} from '../../../common/cards/Tag';

export class RedHotAsteroid extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.EVENT,
      name: CardName.RED_HOT_ASTEROID,
      tags: [Tag.SPACE, Tag.EVENT],
      cost: 29,
      behavior: {
        global: {temperature: 2},
        production: {heat: 2},
        stock: {heat: 2},
      },
      metadata: {
        cardNumber: 'E109',
        renderData: CardRenderer.builder((b) => {
          b.temperature(2).production((pb) => pb.heat(2)).heat(2);
        }),
        description: 'Raise the temperature 2 steps. Increase your heat production 2 steps. Gain 2 heat.',
      },
    });
  }
}
