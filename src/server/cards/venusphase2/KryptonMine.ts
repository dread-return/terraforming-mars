import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {TileType} from '../../../common/TileType';

export class KryptonMine extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.AUTOMATED,
      name: CardName.KRYPTON_MINE,
      tags: [Tag.VENUS, Tag.BUILDING],
      cost: 32,
      tilesBuilt: [TileType.VENUS_GAS_MINE],

      behavior: {
        production: {heat: 2, energy: 1, megacredits: 2},
        venusMap: {gasMine: 1},
      },

      metadata: {
        cardNumber: 'V88',
        renderData: CardRenderer.builder((b) => {
          b.tile(TileType.VENUS_GAS_MINE).venus(1).br;
          b.production((pb) => pb.heat(2).energy(1).megacredits(2));
        }),
        description: 'Place a Gas Mine on Venus and raise Venus 1 step. Increase your heat production 2 steps, your energy production 1 step and your M€ production 2 steps.',
      },
    });
  }
}
