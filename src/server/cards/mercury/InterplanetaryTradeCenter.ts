import {CardName} from '../../../common/cards/CardName';
import {CardType} from '../../../common/cards/CardType';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {Card} from '../Card';
import {IProjectCard} from '../IProjectCard';

export class InterplanetaryTradeCenter extends Card implements IProjectCard {
  constructor() {
    super({
      name: CardName.INTERPLANETARY_TRADE_CENTER,
      type: CardType.ACTIVE,
      tags: [Tag.BUILDING, Tag.EARTH],
      cost: 14,
      behavior: {
        production: {megacredits: 3},
      },
      metadata: {
        cardNumber: 'MM15',
        renderData: CardRenderer.builder((b) => {
          // The effect itself is in Mercury.onTrade.
          b.effect('When you trade, add 1 asset to an Act.', (eb) => {
            eb.trade().startEffect.asset(1);
          }).br;
          b.production((pb) => pb.megacredits(3));
        }),
        description: 'Increase your M€ production 3 steps.',
      },
    });
  }
}
