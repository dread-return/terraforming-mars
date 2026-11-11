import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {PreludeCard} from '../prelude/PreludeCard';
import {SelectPaymentDeferred} from '../../deferredActions/SelectPaymentDeferred';
import {Tag} from '../../../common/cards/Tag';

export class ColonizationProject extends PreludeCard {
  constructor() {
    super({
      name: CardName.COLONIZATION_PROJECT,
      tags: [Tag.PLANT, Tag.CITY],
      startingMegacredits: -8,
      behavior: {
        greenery: {},
        city: {on: 'isolated'},
      },
      metadata: {
        cardNumber: 'EP07',
        renderData: CardRenderer.builder((b) => {
          b.greenery().city().asterix().megacredits(-8);
        }),
        description: 'Place a greenery tile. Place a city tile not adjacent to any other tile. Pay 8 M\u20ac.',
      },
    });
  }

  public override bespokeCanPlay(player: IPlayer) {
    return player.canAfford(8);
  }
  public override bespokePlay(player: IPlayer) {
    player.game.defer(new SelectPaymentDeferred(player, 8));
    return undefined;
  }
}
