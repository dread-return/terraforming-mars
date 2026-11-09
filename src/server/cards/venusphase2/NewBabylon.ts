import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {TileType} from '../../../common/TileType';

export class NewBabylon extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.AUTOMATED,
      name: CardName.NEW_BABYLON,
      tags: [Tag.CITY, Tag.VENUS],
      cost: 22,
      requirements: {venus: 12},
      tilesBuilt: [TileType.VENUS_HABITAT],

      behavior: {
        production: {plants: 2},
        venusMap: {habitat: 1},
      },

      metadata: {
        cardNumber: 'V96',
        renderData: CardRenderer.builder((b) => {
          b.tile(TileType.VENUS_HABITAT).venus(1).nbsp.production((pb) => pb.plants(2));
        }),
        description: 'Requires 12% Venus. Increase your plant production 2 steps. Place a Venus Habitat and raise Venus 1 step.',
      },
    });
  }
}
