import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {IActionCard} from '../ICard';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardResource} from '../../../common/CardResource';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';

export class BudgetManagement extends Card implements IProjectCard, IActionCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.BUDGET_MANAGEMENT,
      tags: [Tag.EARTH],
      cost: 3,
      resourceType: CardResource.BUDGET,
      victoryPoints: {resourcesHere: {}, per: 2},

      metadata: {
        cardNumber: 'I09',
        renderData: CardRenderer.builder((b) => {
          b.action('Add 1 budget to this card if you have 3 or fewer cards in hand, or 2 if you have none.', (eb) => {
            eb.text('max 3').cards(1).startAction.resource(CardResource.BUDGET).asterix();
          }).br;
          b.vpText('1 VP for every 2 budget on this card.');
        }),
      },
    });
  }

  public canAct(player: IPlayer) {
    return player.cardsInHand.length <= 3;
  }

  public action(player: IPlayer) {
    const qty = player.cardsInHand.length === 0 ? 2 : 1;
    player.addResourceTo(this, {qty, log: true});
    return undefined;
  }
}
