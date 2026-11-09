import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {TileType} from '../../../common/TileType';

export class RadonMine extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.AUTOMATED,
      name: CardName.RADON_MINE,
      tags: [Tag.VENUS, Tag.BUILDING],
      cost: 28,
      tilesBuilt: [TileType.VENUS_GAS_MINE],

      behavior: {
        production: {heat: 2, megacredits: 2},
        venusMap: {gasMine: 1},
      },

      metadata: {
        cardNumber: 'V87',
        renderData: CardRenderer.builder((b) => {
          b.tile(TileType.VENUS_GAS_MINE).venus(1).br;
          b.production((pb) => pb.heat(2).megacredits(2));
        }),
        description: 'Place a Gas Mine on Venus and raise Venus 1 step. Increase your heat production 2 steps and your M€ production 2 steps.',
      },
    });
  }
}
