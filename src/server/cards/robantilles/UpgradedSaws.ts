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

export class UpgradedSaws extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.UPGRADED_SAWS,
      tags: [Tag.SCIENCE],
      cost: 9,

      metadata: {
        cardNumber: 'H13',
        renderData: CardRenderer.builder((b) => {
          b.effect('When you place a greenery tile, increase your M€ production 1 step.', (eb) => {
            eb.greenery().startEffect.production((pb) => pb.megacredits(1));
          });
        }),
      },
    });
  }

  public onTilePlaced(cardOwner: IPlayer, activePlayer: IPlayer, space: Space, boardType: BoardType) {
    if (boardType !== BoardType.MARS || cardOwner !== activePlayer || !Board.isGreenerySpace(space)) {
      return;
    }
    cardOwner.production.add(Resource.MEGACREDITS, 1, {log: true});
  }
}
