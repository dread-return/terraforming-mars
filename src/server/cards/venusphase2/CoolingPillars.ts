import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {TileType} from '../../../common/TileType';

export class CoolingPillars extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.AUTOMATED,
      name: CardName.COOLING_PILLARS,
      tags: [Tag.VENUS, Tag.POWER, Tag.BUILDING],
      cost: 18,
      tilesBuilt: [TileType.VENUS_FLOATING_ARRAY],

      behavior: {
        production: {energy: 1},
        venusMap: {floatingArray: 1},
      },

      metadata: {
        cardNumber: 'V63',
        renderData: CardRenderer.builder((b) => {
          b.production((pb) => pb.energy(1)).nbsp.tile(TileType.VENUS_FLOATING_ARRAY).venus(1);
        }),
        description: 'Increase your energy production 1 step. Place a Floating Array on Venus and raise Venus 1 step.',
      },
    });
  }
}
