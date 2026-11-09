import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {TileType} from '../../../common/TileType';

export class NewAlexandria extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.AUTOMATED,
      name: CardName.NEW_ALEXANDRIA,
      tags: [Tag.CITY, Tag.VENUS],
      cost: 20,
      requirements: {venus: 6},
      tilesBuilt: [TileType.VENUS_HABITAT],

      behavior: {
        production: {energy: -1, megacredits: 3},
        venusMap: {habitat: 1},
      },

      metadata: {
        cardNumber: 'V74',
        renderData: CardRenderer.builder((b) => {
          b.production((pb) => pb.minus().energy(1).nbsp.plus().megacredits(3)).br;
          b.tile(TileType.VENUS_HABITAT).venus(1);
        }),
        description: 'Requires 6% Venus. Decrease your energy production 1 step and increase your M€ production 3 steps. ' +
          'Place a Venus Habitat and raise Venus 1 step.',
      },
    });
  }
}
