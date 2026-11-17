import {CardName} from '../../../common/cards/CardName';
import {CardType} from '../../../common/cards/CardType';
import {Tag} from '../../../common/cards/Tag';
import {PartyName} from '../../../common/turmoil/PartyName';
import {CardRenderer} from '../render/CardRenderer';
import {Card} from '../Card';
import {IProjectCard} from '../IProjectCard';
import {IPlayer} from '../../IPlayer';
import {PlaceGreeneryTile} from '../../deferredActions/PlaceGreeneryTile';
import {Board} from '../../boards/Board';

export class AlgaeFuelFarms extends Card implements IProjectCard {
  constructor() {
    super({
      name: CardName.ALGAE_FUEL_FARMS,
      type: CardType.AUTOMATED,
      tags: [Tag.PLANT, Tag.POWER],
      cost: 21,
      requirements: {party: PartyName.GREENS},
      behavior: {
        production: {energy: 1},
      },
      metadata: {
        cardNumber: 'MM26',
        renderData: CardRenderer.builder((b) => {
          b.greenery().asterix().production((pb) => pb.energy(1));
        }),
        description: 'Requires that Greens are ruling or that you have 2 delegates there. Place a greenery tile adjacent to an ocean. Increase your energy production 1 step.',
      },
    });
  }

  private spaces(player: IPlayer) {
    const board = player.game.board;
    return board.getAvailableSpacesOnLand(player).filter((space) => board.getAdjacentSpaces(space).some(Board.isOceanSpace));
  }

  public override bespokePlay(player: IPlayer) {
    const spaces = this.spaces(player);
    if (spaces.length > 0) {
      player.game.defer(new PlaceGreeneryTile(player, 'greenery', spaces));
    }
    return undefined;
  }
}
