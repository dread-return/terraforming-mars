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
import {PartyName} from '../../../common/turmoil/PartyName';
import {OrOptions} from '../../inputs/OrOptions';
import {SelectOption} from '../../inputs/SelectOption';
import {Resource} from '../../../common/Resource';

export class TradeAgreements extends Card implements IActionCard, IProjectCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.TRADE_AGREEMENTS,
      tags: [Tag.SPACE],
      cost: 17,
      requirements: {party: PartyName.UNITY},
      victoryPoints: {colonies: {colonies: {}}},

      metadata: {
        cardNumber: 'S27',
        renderData: CardRenderer.builder((b) => {
          b.action('Pay 2 steel or 2 plants to trade with a colony. This uses one of your trade fleets.', (eb) => {
            eb.steel(2).slash().plants(2).startAction.trade();
          }).br;
          b.vpText('1 VP for each colony you have.');
        }),
        description: 'Requires that Unity is ruling or that you have 2 delegates there.',
      },
    });
  }

  public canAct(player: IPlayer): boolean {
    return player.colonies.canTrade() && (player.steel >= 2 || player.plants >= 2);
  }

  private trade(player: IPlayer, resource: 'steel' | 'plants') {
    player.stock.deduct(resource, 2);
    player.defer(
      new SelectColony('Select colony tile to trade with', 'Select', ColoniesHandler.tradeableColonies(player.game))
        .andThen((colony) => {
          player.game.log('${0} spent 2 ${1} to trade with ${2}', (b) => b.player(player).string(resource).colony(colony));
          colony.trade(player);
          return undefined;
        }));
    return undefined;
  }

  public action(player: IPlayer) {
    const options: Array<SelectOption> = [];
    if (player.steel >= 2) {
      options.push(new SelectOption('Pay 2 steel').andThen(() => this.trade(player, Resource.STEEL)));
    }
    if (player.plants >= 2) {
      options.push(new SelectOption('Pay 2 plants').andThen(() => this.trade(player, Resource.PLANTS)));
    }
    if (options.length === 1) {
      return options[0].cb(undefined);
    }
    return new OrOptions(...options);
  }
}
