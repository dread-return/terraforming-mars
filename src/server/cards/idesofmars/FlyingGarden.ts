import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {PartyName} from '../../../common/turmoil/PartyName';
import {IPlayer} from '../../IPlayer';
import {TileType} from '../../../common/TileType';
import {SpaceType} from '../../../common/boards/SpaceType';
import {SpaceName} from '../../../common/boards/SpaceName';
import {Board} from '../../boards/Board';
import {Space} from '../../boards/Space';
import {SelectSpace} from '../../inputs/SelectSpace';

/**
 * I26. The greenery goes on its own off-world space (Flying Garden, next to Ganymede and the other
 * off-world spaces), linked to the off-world city it was placed next to: that city scores it as an
 * adjacent greenery. "Off-world city" = a city on an off-Mars space (Ganymede, Phobos, Stanford Torus…).
 */
export class FlyingGarden extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.AUTOMATED,
      name: CardName.FLYING_GARDEN,
      tags: [Tag.PLANT, Tag.SPACE],
      cost: 20,
      victoryPoints: 2,
      requirements: {party: PartyName.SPOME},

      behavior: {
        production: {energy: -1, plants: 1},
      },

      metadata: {
        cardNumber: 'I26',
        renderData: CardRenderer.builder((b) => {
          b.production((pb) => pb.minus().energy(1).nbsp.plus().plants(1)).nbsp.greenery().asterix();
        }),
        description: 'Requires Spome ruling or 2 delegates there. Swap 1 energy production for 1 plant production. ' +
          'Place a greenery next to an off-world city (no oxygen).',
      },
    });
  }

  public static offWorldCities(player: IPlayer): Array<Space> {
    return player.game.board.spaces.filter((space) => space.spaceType === SpaceType.COLONY && Board.isCitySpace(space));
  }

  private gardenSpace(player: IPlayer): Space | undefined {
    const space = player.game.board.spaces.find((s) => s.id === SpaceName.FLYING_GARDEN);
    return space?.tile === undefined ? space : undefined;
  }

  public override bespokeCanPlay(player: IPlayer) {
    return this.gardenSpace(player) !== undefined && FlyingGarden.offWorldCities(player).length > 0;
  }

  public override bespokePlay(player: IPlayer) {
    const garden = this.gardenSpace(player);
    if (garden === undefined) {
      return undefined;
    }
    return new SelectSpace('Select the off-world city the Flying Garden is next to', FlyingGarden.offWorldCities(player))
      .andThen((city) => {
        player.game.addTile(player, garden, {tileType: TileType.GREENERY, card: this.name, nextTo: city.id});
        return undefined;
      });
  }
}
