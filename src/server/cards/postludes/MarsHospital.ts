import {CardName} from '../../../common/cards/CardName';
import {CardType} from '../../../common/cards/CardType';
import {CardRenderer} from '../render/CardRenderer';
import {PostludeCard} from './PostludeCard';
import {Tag} from '../../../common/cards/Tag';
import {BoardType} from '../../boards/BoardType';
import {IPlayer} from '../../IPlayer';
import {MAX_OXYGEN_LEVEL} from '../../../common/constants';
import {Postludes} from '../../postludes/Postludes';
import {Size} from '../../../common/cards/render/Size';
import {Space} from '../../boards/Space';
import {TileType} from '../../../common/TileType';

export class MarsHospital extends PostludeCard {
  constructor() {
    super({
      name: CardName.MARS_HOSPITAL,
      type: CardType.ACTIVE,
      cost: 6,
      tags: [Tag.MARS, Tag.BUILDING],
      postludeKind: 'city',

      metadata: {
        cardNumber: 'L09',
        renderData: CardRenderer.builder((b) => {
          b.effect('Greeneries placed adjacent to this tile give 1 TR even if oxygen is already maxed out.', (eb) => eb.greenery({size: Size.SMALL, withO2: true}).asterix().startEffect.tr(1));
        }),
        description: 'Place the Hospital tile on top of one of your cities. Effect: greeneries you place adjacent to this tile give 1 TR even if oxygen is already maxed out.',
      },
    });
  }

  public onTilePlaced(cardOwner: IPlayer, activePlayer: IPlayer, space: Space, boardType: BoardType) {
    if (cardOwner !== activePlayer || boardType !== BoardType.MARS || space.tile?.tileType !== TileType.GREENERY) {
      return;
    }
    // Greeneries are placed before the oxygen goes up, so a maxed oxygen level means no TR is coming.
    if (cardOwner.game.getOxygenLevel() < MAX_OXYGEN_LEVEL) {
      return;
    }
    if (!Postludes.adjacentTo(cardOwner.game, this.name).includes(space)) {
      return;
    }
    cardOwner.increaseTerraformRating(1, {log: true});
  }
}
