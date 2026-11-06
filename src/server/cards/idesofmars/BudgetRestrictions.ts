import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';

export class BudgetRestrictions extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.BUDGET_RESTRICTIONS,
      tags: [Tag.EARTH],
      cost: 7,

      behavior: {
        production: {megacredits: 3},
      },

      metadata: {
        cardNumber: 'I01',
        renderData: CardRenderer.builder((b) => {
          b.effect('You can buy at most 3 cards during the research phase.', (eb) => {
            eb.empty().startEffect.text('max 3').cards(1);
          }).br;
          b.production((pb) => pb.megacredits(3));
        }),
        description: 'Increase your M€ production 3 steps.',
      },
    });
  }
}
