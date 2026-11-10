import {BoardType} from '../../boards/BoardType';
import {Board} from '../../boards/Board';
import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {CardType} from '../../../common/cards/CardType';
import {Card} from '../Card';
import {IPlayer} from '../../IPlayer';
import {IProjectCard} from '../IProjectCard';
import {Resource} from '../../../common/Resource';
import {Space} from '../../boards/Space';
import {Tag} from '../../../common/cards/Tag';

export class MartianGMOs extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.MARTIAN_GMOS,
      tags: [Tag.MARS, Tag.SCIENCE, Tag.PLANT],
      cost: 8,
      requirements: {display: 'plantProduction', count: 2},
      metadata: {
        cardNumber: 'E25',
        renderData: CardRenderer.builder((b) => {
          b.effect('When you place a greenery tile, gain 1 plant.', (eb) => eb.greenery({withO2: false}).startEffect.plants(1));
        }),
        description: 'Requires 2 plant production.',
      },
    });
  }

  public override bespokeCanPlay(player: IPlayer) {
    return player.production.plants >= 2;
  }
  public onTilePlaced(cardOwner: IPlayer, activePlayer: IPlayer, space: Space, boardType: BoardType) {
    if (boardType === BoardType.MARS && cardOwner === activePlayer && Board.isGreenerySpace(space)) {
      cardOwner.stock.add(Resource.PLANTS, 1, {log: true});
    }
  }
}
