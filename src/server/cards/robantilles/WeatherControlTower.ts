import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {Space} from '../../boards/Space';
import {BoardType} from '../../boards/BoardType';
import {Board} from '../../boards/Board';
import {Resource} from '../../../common/Resource';

export class WeatherControlTower extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.WEATHER_CONTROL_TOWER,
      tags: [Tag.BUILDING],
      cost: 8,
      requirements: {oxygen: 6},

      metadata: {
        cardNumber: 'H18',
        renderData: CardRenderer.builder((b) => {
          b.effect('Whenever any greenery tile is placed, gain 2 M€.', (eb) => {
            eb.greenery({any: true}).startEffect.megacredits(2);
          });
        }),
        description: 'Requires 6% oxygen.',
      },
    });
  }

  public onTilePlaced(cardOwner: IPlayer, _activePlayer: IPlayer, space: Space, boardType: BoardType) {
    if (boardType === BoardType.MARS && Board.isGreenerySpace(space)) {
      cardOwner.stock.add(Resource.MEGACREDITS, 2, {log: true});
    }
  }
}
