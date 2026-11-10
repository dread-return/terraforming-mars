import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {CardType} from '../../../common/cards/CardType';
import {Card} from '../Card';
import {IProjectCard} from '../IProjectCard';

export class CalculatedAI extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.EVENT,
      name: CardName.CALCULATED_AI,
      tags: [],
      cost: 2,
      behavior: {
        stock: {megacredits: 6},
      },
      metadata: {
        cardNumber: 'E51',
        renderData: CardRenderer.builder((b) => {
          b.megacredits(6);
        }),
        description: 'Gain 6 M\u20ac.',
      },
    });
  }
}
