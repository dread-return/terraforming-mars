import {IActionCard} from '../ICard';
import {IProjectCard} from '../IProjectCard';
import {Tag} from '../../../common/cards/Tag';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {SelectColony} from '../../inputs/SelectColony';
import {ColoniesHandler} from '../../colonies/ColoniesHandler';

export class EinsteinRosenGateway extends Card implements IActionCard, IProjectCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.EINSTEIN_ROSEN_GATEWAY,
      tags: [Tag.JOVIAN, Tag.SPACE, Tag.GALACTIC],
      cost: 27,
      requirements: {colonies: 3},
      victoryPoints: {tag: Tag.GALACTIC, each: 3},

      metadata: {
        cardNumber: 'S05',
        renderData: CardRenderer.builder((b) => {
          b.action('Trade with a colony for free. This uses one of your trade fleets.', (eb) => {
            eb.empty().startAction.trade();
          }).br;
          b.vpText('3 VP for each Galactic tag you have, including this.');
        }),
        description: 'Requires that you have 3 colonies.',
      },
    });
  }

  public canAct(player: IPlayer): boolean {
    return player.colonies.canTrade();
  }

  public action(player: IPlayer) {
    return new SelectColony('Select colony tile to trade with for free', 'Select', ColoniesHandler.tradeableColonies(player.game))
      .andThen((colony) => {
        player.game.log('${0} used ${1} to trade with ${2}', (b) => b.player(player).card(this).colony(colony));
        colony.trade(player);
        return undefined;
      });
  }
}
