import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {SelectColony} from '../../inputs/SelectColony';

export class SmugglingOperations extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.EVENT,
      name: CardName.SMUGGLING_OPERATIONS,
      tags: [Tag.SPACE],
      cost: 12,

      metadata: {
        cardNumber: 'B52',
        renderData: CardRenderer.builder((b) => {
          b.colonies(1).asterix().colon().trade().nbsp.text('+ colony bonus');
        }),
        description: 'Choose a colony tile. Gain its trade bonus at the current track position and its colony bonus. ' +
          'No other player gains anything, and the track does not move.',
      },
    });
  }

  public override bespokeCanPlay(player: IPlayer) {
    return player.game.colonies.some((colony) => colony.isActive);
  }

  public override bespokePlay(player: IPlayer) {
    const colonies = player.game.colonies.filter((colony) => colony.isActive);
    return new SelectColony('Select a colony tile to smuggle from', 'Smuggle', colonies)
      .andThen((colony) => {
        player.game.log('${0} smuggled from ${1}', (b) => b.player(player).colony(colony));
        colony.trade(player, {
          selfishTrade: true,
          giveColonyBonuses: false,
          usesTradeFleet: false,
          decreaseTrackAfterTrade: false,
        });
        colony.giveColonyBonus(player);
        return undefined;
      });
  }
}
