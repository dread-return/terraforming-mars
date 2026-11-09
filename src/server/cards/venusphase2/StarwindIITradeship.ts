import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {IActionCard} from '../ICard';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {tradeWithColony} from './VenusPhase2Helpers';

export class StarwindIITradeship extends Card implements IProjectCard, IActionCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.STARWIND_II_TRADESHIP,
      tags: [Tag.SPACE],
      cost: 16,
      victoryPoints: 1,

      behavior: {
        colonies: {addTradeFleet: 1},
      },

      metadata: {
        cardNumber: 'V81',
        renderData: CardRenderer.builder((b) => {
          b.action('Spend 3 heat to trade with a colony. This uses one of your trade fleets.', (eb) => {
            eb.heat(3).startAction.trade();
          }).br;
          b.tradeFleet();
        }),
        description: 'Gain a trade fleet.',
      },
    });
  }

  public canAct(player: IPlayer) {
    return player.availableHeat() >= 3 && player.colonies.canTrade();
  }

  public action(player: IPlayer) {
    return player.spendHeat(3, () => tradeWithColony(player, this));
  }
}
