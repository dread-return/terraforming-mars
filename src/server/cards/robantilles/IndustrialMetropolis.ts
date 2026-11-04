import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {TileType} from '../../../common/TileType';
import {SpaceBonus} from '../../../common/boards/SpaceBonus';
import {RobAntillesTiles} from './RobAntillesTiles';
import {specialTiles} from './RobAntillesRender';

export class IndustrialMetropolis extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.AUTOMATED,
      name: CardName.INDUSTRIAL_METROPOLIS,
      tags: [Tag.BUILDING],
      cost: 19,
      requirements: {cities: 1},
      tilesBuilt: [TileType.METROPOLIS],
      victoryPoints: 'special',

      behavior: {
        production: {energy: -1, steel: 1},
      },

      metadata: {
        cardNumber: 'H04',
        renderData: CardRenderer.builder((b) => {
          b.production((pb) => {
            pb.minus().energy(1).br;
            pb.plus().steel(1);
          }).nbsp.tile(TileType.METROPOLIS, false).asterix();
        }),
        description: 'Requires that you own a city. Place the Metropolis on one of your cities. ' +
          '1 VP per special tile next to it. Adjacency bonus: 1 steel.',
        victoryPoints: specialTiles(1, 1),
      },
    });
  }

  public override bespokeCanPlay(player: IPlayer) {
    return RobAntillesTiles.ownTiles(player, TileType.CITY).length > 0;
  }

  public override bespokePlay(player: IPlayer) {
    return RobAntillesTiles.place(player, this.name, TileType.METROPOLIS, RobAntillesTiles.ownTiles(player, TileType.CITY),
      [SpaceBonus.STEEL], 'Select one of your cities for the Metropolis');
  }

  public override getVictoryPoints(player: IPlayer) {
    const space = RobAntillesTiles.spaceFor(player, this.name);
    if (space === undefined) {
      return 0;
    }
    return player.game.board.getAdjacentSpaces(space).filter(RobAntillesTiles.isSpecialTile).length;
  }
}
