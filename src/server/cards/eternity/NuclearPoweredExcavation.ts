import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {PreludeCard} from '../prelude/PreludeCard';
import {SelectPaymentDeferred} from '../../deferredActions/SelectPaymentDeferred';
import {Tag} from '../../../common/cards/Tag';

export class NuclearPoweredExcavation extends PreludeCard {
  constructor() {
    super({
      name: CardName.NUCLEAR_POWERED_EXCAVATION,
      tags: [Tag.POWER, Tag.BUILDING],
      startingMegacredits: -3,
      behavior: {
        production: {steel: 1, energy: 2},
      },
      metadata: {
        cardNumber: 'EP43',
        renderData: CardRenderer.builder((b) => {
          b.production((pb) => pb.steel(1).energy(2)).megacredits(-3);
        }),
        description: 'Increase your steel production 1 step and your energy production 2 steps. Pay 3 M\u20ac.',
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
