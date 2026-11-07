import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {max} from '../Options';

export class Chemtrails extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.AUTOMATED,
      name: CardName.CHEMTRAILS,
      cost: 20,
      requirements: {oxygen: 9, max},
      behavior: {
        global: {oxygen: 1},
        production: {titanium: 1},
        stock: {titanium: 1, steel: 1},
      },

      metadata: {
        cardNumber: 'N06',
        renderData: CardRenderer.builder((b) => {
          b.oxygen(1).nbsp.production((pb) => pb.titanium(1)).nbsp.titanium(1).steel(1);
        }),
        description: 'Requires oxygen at most 9%. Raise oxygen 1 step. Increase your titanium production 1 step. Gain 1 titanium and 1 steel.',
      },
    });
  }
}
