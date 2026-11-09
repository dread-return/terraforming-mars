import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardResource} from '../../../common/CardResource';
import {CardRenderer} from '../render/CardRenderer';
import {TileType} from '../../../common/TileType';

export class NewAthens extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.AUTOMATED,
      name: CardName.NEW_ATHENS,
      tags: [Tag.CITY, Tag.VENUS],
      cost: 19,
      requirements: {venus: 8},
      tilesBuilt: [TileType.VENUS_HABITAT],

      behavior: {
        addResourcesToAnyCard: [
          {count: 1, type: CardResource.SCIENCE},
          {count: 2, type: CardResource.FLOATER},
        ],
        venusMap: {habitat: 1},
      },

      metadata: {
        cardNumber: 'V89',
        renderData: CardRenderer.builder((b) => {
          b.tile(TileType.VENUS_HABITAT).venus(1).br;
          b.resource(CardResource.SCIENCE).asterix().resource(CardResource.FLOATER, 2).asterix();
        }),
        description: 'Requires 8% Venus. Add a science resource to any card and 2 floaters to any card. ' +
          'Place a Venus Habitat and raise Venus 1 step.',
      },
    });
  }
}
