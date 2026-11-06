import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {SelectColony} from '../../inputs/SelectColony';
import {IColony} from '../../colonies/IColony';

export class SpacePirates extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.EVENT,
      name: CardName.SPACE_PIRATES,
      tags: [Tag.SPACE],
      cost: 8,

      metadata: {
        cardNumber: 'I28',
        renderData: CardRenderer.builder((b) => {
          b.tradeFleet().trade().asterix();
        }),
        description: 'Get a neutral trade fleet and trade with a colony. Collect the colony bonus for each colony on that tile ' +
          '(other players don\'t get theirs). Remove this fleet at the end of the generation.',
      },
    });
  }

  private tradeable(player: IPlayer): Array<IColony> {
    return player.game.colonies.filter((colony) => colony.isActive && colony.visitor === undefined);
  }

  public override bespokeCanPlay(player: IPlayer) {
    return this.tradeable(player).length > 0;
  }

  public override bespokePlay(player: IPlayer) {
    return new SelectColony('Select a colony tile for the pirate fleet to trade with', 'Trade', this.tradeable(player))
      .andThen((colony) => {
        colony.trade(player, {selfishTrade: true, usesTradeFleet: false});
        // The neutral fleet stays on the tile until the end of the generation.
        colony.visitor = player.id;
        player.game.log('${0} sent a pirate fleet to ${1}', (b) => b.player(player).colony(colony));
        return undefined;
      });
  }
}
