import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardResource} from '../../../common/CardResource';
import {CardRenderer} from '../render/CardRenderer';
import {TileType} from '../../../common/TileType';

export class AphroditeShuttleBase extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.AUTOMATED,
      name: CardName.APHRODITE_SHUTTLE_BASE,
      tags: [Tag.JOVIAN, Tag.SPACE],
      cost: 23,
      victoryPoints: 1,
      tilesBuilt: [TileType.VENUS_FLOATING_ARRAY],

      behavior: {
        venusMap: {floatingArray: 1},
        addResourcesToAnyCard: {count: 3, type: CardResource.FLOATER, tag: Tag.JOVIAN},
      },

      metadata: {
        cardNumber: 'V94',
        renderData: CardRenderer.builder((b) => {
          b.tile(TileType.VENUS_FLOATING_ARRAY).venus(1).br;
          b.resource(CardResource.FLOATER, {amount: 3, secondaryTag: Tag.JOVIAN});
        }),
        description: 'Place a Floating Array on Venus and raise Venus 1 step. Add 3 floaters to a Jovian card.',
      },
    });
  }
}
