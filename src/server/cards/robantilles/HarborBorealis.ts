import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {TileType} from '../../../common/TileType';
import {SpaceBonus} from '../../../common/boards/SpaceBonus';
import {Units} from '../../../common/Units';
import {Board} from '../../boards/Board';
import {Space} from '../../boards/Space';
import {RobAntillesTiles} from './RobAntillesTiles';
import {oceans} from '../render/DynamicVictoryPoints';

export class HarborBorealis extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.AUTOMATED,
      name: CardName.HARBOR_BOREALIS,
      tags: [Tag.MARS, Tag.BUILDING],
      cost: 25,
      requirements: {oceans: 5},
      tilesBuilt: [TileType.HARBOR],
      victoryPoints: {oceans: {}, nextToThis: {}},

      metadata: {
        cardNumber: 'H02',
        renderData: CardRenderer.builder((b) => {
          b.tile(TileType.HARBOR, false).asterix().nbsp;
          b.production((pb) => pb.megacredits(1).slash().oceans(1).asterix());
        }),
        description: 'Requires 5 oceans. Place the Harbor over an ocean next to a city. +1 M€ production and 1 VP ' +
          'per ocean next to it. Adjacency bonus: 1 steel.',
        victoryPoints: oceans(1, 1),
      },
    });
  }

  private spaces(player: IPlayer): ReadonlyArray<Space> {
    const board = player.game.board;
    return board.spaces.filter((space) =>
      space.tile?.tileType === TileType.OCEAN &&
      space.cube === undefined &&
      board.getAdjacentSpaces(space).some(Board.isCitySpace));
  }

  public override bespokeCanPlay(player: IPlayer) {
    return this.spaces(player).length > 0;
  }

  public override bespokePlay(player: IPlayer) {
    return RobAntillesTiles.place(player, this.name, TileType.HARBOR, this.spaces(player),
      [SpaceBonus.STEEL], 'Select an ocean next to a city for the Harbor', () => {
        player.production.adjust(this.productionBox(player), {log: true});
      });
  }

  public productionBox(player: IPlayer) {
    const space = RobAntillesTiles.spaceFor(player, this.name);
    const adjacentOceans = space === undefined ? 0 : player.game.board.getAdjacentSpaces(space).filter(Board.isOceanSpace).length;
    return Units.of({megacredits: adjacentOceans});
  }
}
