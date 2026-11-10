import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {PreludeCard} from '../prelude/PreludeCard';
import {SelectPaymentDeferred} from '../../deferredActions/SelectPaymentDeferred';
import {Tag} from '../../../common/cards/Tag';

export class LiveOffTheLand extends PreludeCard {
  constructor() {
    super({
      name: CardName.LIVE_OFF_THE_LAND,
      tags: [Tag.PLANT],
      startingMegacredits: -12,
      behavior: {
        production: {plants: 3},
      },
      metadata: {
        cardNumber: 'EP04',
        renderData: CardRenderer.builder((b) => {
          b.production((pb) => pb.plants(3)).megacredits(-12);
        }),
        description: 'Increase your plant production 3 steps. Lose 12 M\u20ac.',
      },
    });
  }

  public override bespokeCanPlay(player: IPlayer) {
    return player.canAfford(12);
  }
  public override bespokePlay(player: IPlayer) {
    player.game.defer(new SelectPaymentDeferred(player, 12));
    return undefined;
  }
}
