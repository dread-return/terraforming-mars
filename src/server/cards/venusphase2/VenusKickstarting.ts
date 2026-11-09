import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {TileType} from '../../../common/TileType';

export class VenusKickstarting extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.EVENT,
      name: CardName.VENUS_KICKSTARTING,
      tags: [Tag.VENUS],
      cost: 22,
      requirements: {venus: 16, max: true},
      tilesBuilt: [TileType.VENUS_FLOATING_ARRAY],

      behavior: {
        venusMap: {floatingArray: 2},
      },

      metadata: {
        cardNumber: 'V78',
        renderData: CardRenderer.builder((b) => {
          b.tile(TileType.VENUS_FLOATING_ARRAY).tile(TileType.VENUS_FLOATING_ARRAY).br;
          b.venus(2);
        }),
        description: 'Venus must be 16% or lower. Place 2 Floating Arrays on Venus, raising Venus 1 step each.',
      },
    });
  }
}
