import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardResource} from '../../../common/CardResource';
import {CardRenderer} from '../render/CardRenderer';
import {TileType} from '../../../common/TileType';

export class RadioactiveDeflux extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.AUTOMATED,
      name: CardName.RADIOACTIVE_DEFLUX,
      tags: [Tag.RADIOACTIVE, Tag.BUILDING],
      cost: 13,
      requirements: {oceans: 4},
      behavior: {
        production: {heat: 2},
        addResourcesToAnyCard: {type: CardResource.RADIATION, count: 2},
        tile: {type: TileType.RADIOACTIVE_DEFLUX, on: 'land', title: 'Select space for Radioactive Deflux'},
      },

      metadata: {
        cardNumber: 'N30',
        renderData: CardRenderer.builder((b) => {
          b.production((pb) => pb.heat(2)).nbsp.resource(CardResource.RADIATION, 2).asterix().nbsp.tile(TileType.RADIOACTIVE_DEFLUX, false);
        }),
        description: 'Requires 4 oceans in play. Increase your heat production 2 steps and add 2 radiation to ANY card. ' +
          'Place the Radioactive Deflux tile on a non-reserved area. Placing a tile next to it costs 1 animal.',
      },
    });
  }
}
