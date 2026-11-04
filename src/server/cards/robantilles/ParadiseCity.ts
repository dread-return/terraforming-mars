import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {TileType} from '../../../common/TileType';
import {SpaceBonus} from '../../../common/boards/SpaceBonus';
import {Board} from '../../boards/Board';
import {Space} from '../../boards/Space';
import {RobAntillesTiles} from './RobAntillesTiles';
import {greeneries} from './RobAntillesRender';

export class ParadiseCity extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.AUTOMATED,
      name: CardName.PARADISE_CITY,
      tags: [Tag.CITY, Tag.PLANT],
      cost: 20,
      tilesBuilt: [TileType.PARADISE_CITY],
      victoryPoints: 'special',

      metadata: {
        cardNumber: 'H07',
        renderData: CardRenderer.builder((b) => {
          b.tile(TileType.PARADISE_CITY, false).asterix().br;
          b.vpText('1 VP per greenery tile adjacent to Paradise City.');
        }),
        description: 'Requires that you own a city next to an ocean. Replace it with the Paradise City tile. ' +
          'It counts as a city. Adjacency bonus: 1 M€.',
        victoryPoints: greeneries(1, 1),
      },
    });
  }

  private spaces(player: IPlayer): ReadonlyArray<Space> {
    const board = player.game.board;
    return RobAntillesTiles.ownTiles(player, TileType.CITY)
      .filter((space) => board.getAdjacentSpaces(space).some(Board.isOceanSpace));
  }

  public override bespokeCanPlay(player: IPlayer) {
    return this.spaces(player).length > 0;
  }

  public override bespokePlay(player: IPlayer) {
    return RobAntillesTiles.place(player, this.name, TileType.PARADISE_CITY, this.spaces(player),
      [SpaceBonus.MEGACREDITS], 'Select one of your cities next to an ocean for Paradise City');
  }

  public override getVictoryPoints(player: IPlayer) {
    const space = RobAntillesTiles.spaceFor(player, this.name);
    if (space === undefined) {
      return 0;
    }
    return player.game.board.getAdjacentSpaces(space).filter(Board.isGreenerySpace).length;
  }
}
