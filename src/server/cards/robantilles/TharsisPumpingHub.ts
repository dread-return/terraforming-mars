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

export class TharsisPumpingHub extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.THARSIS_PUMPING_HUB,
      tags: [Tag.POWER, Tag.MARS, Tag.BUILDING],
      cost: 10,
      requirements: {oceans: 3},
      tilesBuilt: [TileType.PUMPING_HUB],

      behavior: {
        production: {energy: 1},
      },

      metadata: {
        cardNumber: 'H46',
        renderData: CardRenderer.builder((b) => {
          b.effect('During production, you may keep up to 4 energy instead of converting it to heat.', (eb) => {
            eb.energy(4).startEffect.text('keep');
          }).br;
          b.production((pb) => pb.energy(1)).nbsp.tile(TileType.PUMPING_HUB, false).asterix();
        }),
        description: 'Requires 3 ocean tiles. Increase your energy production 1 step and place the Pumping Hub tile next to an ocean. ' +
          'Adjacency bonus: 2 energy.',
      },
    });
  }

  private spaces(player: IPlayer): ReadonlyArray<Space> {
    const board = player.game.board;
    return board.getAvailableSpacesOnLand(player)
      .filter((space) => board.getAdjacentSpaces(space).some(Board.isOceanSpace));
  }

  public override bespokeCanPlay(player: IPlayer) {
    return this.spaces(player).length > 0;
  }

  public override bespokePlay(player: IPlayer) {
    return RobAntillesTiles.place(player, this.name, TileType.PUMPING_HUB, this.spaces(player),
      [SpaceBonus.ENERGY, SpaceBonus.ENERGY], 'Select a space next to an ocean for the Pumping Hub');
  }
}
