import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {ActCard} from '../../mercury/ActCard';
import {Tag} from '../../../common/cards/Tag';

export class StockInvestments extends ActCard {
  constructor() {
    super({
      name: CardName.STOCK_INVESTMENTS,
      kind: 'treaty',
      steps: 7,
      tags: [Tag.EARTH],
      bothBehavior: {production: {megacredits: 3}, stock: {megacredits: 3}},
      metadata: {
        cardNumber: 'ACT27',
        renderData: CardRenderer.builder((b) => {
          b.production((pb) => pb.megacredits(3)).megacredits(3);
        }),
        description: 'Resolve (both): increase your M€ production 3 steps. Gain 3 M€.',
      },
    });
  }
}
