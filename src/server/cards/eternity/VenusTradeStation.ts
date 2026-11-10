import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {ColoniesHandler} from '../../colonies/ColoniesHandler';
import {IPlayer} from '../../IPlayer';
import {PreludeCard} from '../prelude/PreludeCard';
import {SelectColony} from '../../inputs/SelectColony';
import {Tag} from '../../../common/cards/Tag';

export class VenusTradeStation extends PreludeCard {
  constructor() {
    super({
      name: CardName.VENUS_TRADE_STATION,
      tags: [Tag.SPACE, Tag.VENUS],
      behavior: {
        global: {venus: 2},
      },
      metadata: {
        cardNumber: 'EP64',
        renderData: CardRenderer.builder((b) => {
          b.venus(2).trade().asterix();
        }),
        description: 'Raise Venus 2 steps. Trade with a colony for free.',
      },
    });
  }

  public override bespokePlay(player: IPlayer) {
    const colonies = ColoniesHandler.tradeableColonies(player.game);
    if (colonies.length === 0) {
      return undefined;
    }
    player.defer(new SelectColony('Select colony tile to trade with for free', 'Trade', colonies).andThen((colony) => {
      colony.trade(player);
      return undefined;
    }));
    return undefined;
  }
}
