import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {ActCard} from '../../mercury/ActCard';
import {Tag} from '../../../common/cards/Tag';
import {IPlayer} from '../../IPlayer';
import {Resource} from '../../../common/Resource';
import {PlaceOceanTile} from '../../deferredActions/PlaceOceanTile';

export class WaterIceMining extends ActCard {
  constructor() {
    super({
      name: CardName.WATER_ICE_MINING,
      kind: 'treaty',
      steps: 7,
      tags: [Tag.SPACE],
      metadata: {
        cardNumber: 'ACT14',
        renderData: CardRenderer.builder((b) => {
          b.minus().megacredits(4).oceans(1);
        }),
        description: 'Resolve (both): pay 4 M€ and place an ocean tile on Mars.',
      },
    });
  }

  public override resolveFor(player: IPlayer) {
    if (player.megaCredits >= 4) {
      player.stock.deduct(Resource.MEGACREDITS, 4, {log: true});
      player.game.defer(new PlaceOceanTile(player));
    }
  }
}
