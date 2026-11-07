import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';

export class ProforestationFunding extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.AUTOMATED,
      name: CardName.PROFORESTATION_FUNDING,
      tags: [Tag.PLANT],
      cost: 15,
      behavior: {
        production: {megacredits: 1, plants: 1},
        stock: {plants: {greeneries: {}, all: false}},
      },

      metadata: {
        cardNumber: 'N39',
        renderData: CardRenderer.builder((b) => {
          b.production((pb) => pb.megacredits(1).plants(1)).nbsp.plants(1).slash().greenery();
        }),
        description: 'Increase your M€ and plant production 1 step. Gain 1 plant for every greenery you own.',
      },
    });
  }
}
