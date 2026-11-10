import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {PreludeCard} from '../prelude/PreludeCard';
import {SelectPaymentDeferred} from '../../deferredActions/SelectPaymentDeferred';
import {Tag} from '../../../common/cards/Tag';

export class FuelPowerNetwork extends PreludeCard {
  constructor() {
    super({
      name: CardName.FUEL_POWER_NETWORK,
      tags: [Tag.POWER],
      startingMegacredits: -3,
      behavior: {
        production: {energy: 2, heat: 2},
      },
      metadata: {
        cardNumber: 'EP19',
        renderData: CardRenderer.builder((b) => {
          b.production((pb) => pb.energy(2).heat(2)).megacredits(-3);
        }),
        description: 'Increase your energy and heat production 2 steps. Pay 3 M\u20ac.',
      },
    });
  }

  public override bespokeCanPlay(player: IPlayer) {
    return player.canAfford(3);
  }
  public override bespokePlay(player: IPlayer) {
    player.game.defer(new SelectPaymentDeferred(player, 3));
    return undefined;
  }
}
