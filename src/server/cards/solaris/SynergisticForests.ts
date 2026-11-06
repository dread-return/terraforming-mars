import {IProjectCard} from '../IProjectCard';
import {Tag} from '../../../common/cards/Tag';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {PartyName} from '../../../common/turmoil/PartyName';
import {IPlayer} from '../../IPlayer';
import {Space} from '../../boards/Space';
import {BoardType} from '../../boards/BoardType';
import {Resource} from '../../../common/Resource';
import {Board} from '../../boards/Board';

export class SynergisticForests extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.SYNERGISTIC_FORESTS,
      tags: [Tag.PLANT],
      cost: 13,
      requirements: {party: PartyName.GREENS},

      metadata: {
        cardNumber: 'S34',
        renderData: CardRenderer.builder((b) => {
          b.effect('When you place a tile next to one of your greeneries, gain 1 plant.', (eb) => {
            eb.emptyTile().greenery().startEffect.plants(1);
          });
        }),
        description: 'Requires that Greens are ruling or that you have 2 delegates there.',
      },
    });
  }

  public onTilePlaced(cardOwner: IPlayer, activePlayer: IPlayer, space: Space, boardType: BoardType) {
    if (cardOwner !== activePlayer || boardType !== BoardType.MARS) {
      return;
    }
    const board = cardOwner.game.board;
    const nextToOwnGreenery = board.getAdjacentSpaces(space)
      .some((adj) => Board.isGreenerySpace(adj) && adj.player === cardOwner);
    if (nextToOwnGreenery) {
      cardOwner.stock.add(Resource.PLANTS, 1, {log: true, from: {card: this}});
    }
  }
}
