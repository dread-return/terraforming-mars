import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardResource} from '../../../common/CardResource';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {Space} from '../../boards/Space';
import {BoardType} from '../../boards/BoardType';
import {TileType} from '../../../common/TileType';
import {AddResourcesToCard} from '../../deferredActions/AddResourcesToCard';

export class ModularQuarters extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.MODULAR_QUARTERS,
      tags: [Tag.VENUS],
      cost: 18,

      behavior: {
        global: {venus: 1},
      },

      metadata: {
        cardNumber: 'V58',
        renderData: CardRenderer.builder((b) => {
          b.effect('Whenever any Venus Habitat is placed, add 2 floaters to any card.', (eb) => {
            eb.tile(TileType.VENUS_HABITAT).asterix().startEffect.resource(CardResource.FLOATER, 2).asterix();
          }).br;
          b.venus(1);
        }),
        description: 'Raise Venus 1 step.',
      },
    });
  }

  public onTilePlaced(cardOwner: IPlayer, _activePlayer: IPlayer, space: Space, boardType: BoardType) {
    if (boardType === BoardType.VENUS && space.tile?.tileType === TileType.VENUS_HABITAT) {
      cardOwner.game.defer(new AddResourcesToCard(cardOwner, CardResource.FLOATER, {count: 2}));
    }
  }
}
