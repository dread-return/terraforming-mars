import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';

export class Cacti extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.AUTOMATED,
      name: CardName.CACTI,
      tags: [Tag.PLANT],
      cost: 3,
      requirements: {temperature: 8},

      behavior: {
        production: {plants: 1},
      },

      metadata: {
        cardNumber: 'H09',
        renderData: CardRenderer.builder((b) => {
          b.production((pb) => pb.plants(1));
        }),
        description: 'Requires +8 °C or warmer. Increase your plant production 1 step.',
      },
    });
  }
}
