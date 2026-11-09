import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {IActionCard} from '../ICard';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardResource} from '../../../common/CardResource';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {RemoveOwnCardResources} from '../../venus2/RemoveOwnCardResources';
import {tradeWithColony} from './VenusPhase2Helpers';

export class InSituResourceUtilization extends Card implements IProjectCard, IActionCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.IN_SITU_RESOURCE_UTILIZATION,
      tags: [Tag.SPACE],
      cost: 9,

      metadata: {
        cardNumber: 'V56',
        renderData: CardRenderer.builder((b) => {
          b.action('Spend 3 ore from your cards to trade with a colony. This uses one of your trade fleets.', (eb) => {
            eb.resource(CardResource.ORE, 3).asterix().startAction.trade();
          });
        }),
      },
    });
  }

  public canAct(player: IPlayer) {
    return RemoveOwnCardResources.total(player, CardResource.ORE) >= 3 && player.colonies.canTrade();
  }

  public action(player: IPlayer) {
    player.game.defer(new RemoveOwnCardResources(player, CardResource.ORE, 3))
      .andThen(() => player.defer(tradeWithColony(player, this)));
    return undefined;
  }
}
