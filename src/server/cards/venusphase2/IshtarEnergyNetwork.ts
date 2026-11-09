import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardResource} from '../../../common/CardResource';
import {CardRenderer} from '../render/CardRenderer';
import {TileType} from '../../../common/TileType';

export class IshtarEnergyNetwork extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.AUTOMATED,
      name: CardName.ISHTAR_ENERGY_NETWORK,
      tags: [Tag.VENUS, Tag.BUILDING],
      cost: 14,
      tilesBuilt: [TileType.VENUS_FLOATING_ARRAY],

      behavior: {
        venusMap: {floatingArray: 1},
        addResourcesToAnyCard: {count: 1, type: CardResource.FLOATER},
      },

      metadata: {
        cardNumber: 'V95',
        renderData: CardRenderer.builder((b) => {
          b.tile(TileType.VENUS_FLOATING_ARRAY).venus(1).resource(CardResource.FLOATER).asterix();
        }),
        description: 'Place a Floating Array on Venus and raise Venus 1 step. Add a floater to any card.',
      },
    });
  }
}
