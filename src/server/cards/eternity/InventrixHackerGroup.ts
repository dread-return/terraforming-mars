import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {CardResource} from '../../../common/CardResource';
import {PreludeCard} from '../prelude/PreludeCard';
import {Tag} from '../../../common/cards/Tag';

export class InventrixHackerGroup extends PreludeCard {
  constructor() {
    super({
      name: CardName.INVENTRIX_HACKER_GROUP,
      tags: [Tag.POWER, Tag.SCIENCE],
      behavior: {
        drawCard: {count: 3, resource: CardResource.DATA},
        production: {energy: 1},
        stock: {megacredits: 1},
      },
      metadata: {
        cardNumber: 'EP27',
        renderData: CardRenderer.builder((b) => {
          b.cards(3).asterix().production((pb) => pb.energy(1)).megacredits(1);
        }),
        description: 'Reveal cards until you reveal 3 cards that hold data; take them and shuffle the rest back. Increase your energy production 1 step. Gain 1 M\u20ac.',
      },
    });
  }
}
