import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {TileType} from '../../../common/TileType';
import {SpaceType} from '../../../common/boards/SpaceType';
import {SpaceName} from '../../../common/boards/SpaceName';
import {PreludeCard} from '../prelude/PreludeCard';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {Board} from '../../boards/Board';
import {Space} from '../../boards/Space';
import {SelectSpace} from '../../inputs/SelectSpace';

// Off-world spaces reserved for greeneries rather than cities.
const GREENERY_SPACES: ReadonlyArray<string> = [SpaceName.SHADOW_FOREST, SpaceName.FLYING_GARDEN, SpaceName.SPACE_SOLARIUM];

/**
 * P03. The greenery goes on its own off-world space (Space Solarium), linked to a reserved off-world
 * city space (Ganymede, Phobos, Dyson Screens…) whether or not its city is built yet (Leo, 2026-11-19):
 * when that city is built, it scores the greenery as an adjacent one.
 */
export class SpaceSolarium extends PreludeCard {
  constructor() {
    super({
      name: CardName.SPACE_SOLARIUM,
      tags: [Tag.MICROBE, Tag.PLANT, Tag.SPACE],
      behavior: {
        stock: {plants: 5},
      },

      metadata: {
        cardNumber: 'P03',
        renderData: CardRenderer.builder((b) => {
          b.greenery().asterix().nbsp.plants(5);
        }),
        description: 'Place a greenery tile OFF MARS, next to any reserved area for a city (built or not), and raise oxygen 1 step. Gain 5 plants.',
      },
    });
  }

  /** The reserved off-world city spaces: empty, or holding their city. */
  public static reservedCitySpaces(player: IPlayer): Array<Space> {
    return player.game.board.spaces.filter((space) =>
      space.spaceType === SpaceType.COLONY &&
      !GREENERY_SPACES.includes(space.id) &&
      (space.tile === undefined || Board.isCitySpace(space)));
  }

  private solariumSpace(player: IPlayer): Space | undefined {
    const space = player.game.board.spaces.find((s) => s.id === SpaceName.SPACE_SOLARIUM);
    return space?.tile === undefined ? space : undefined;
  }

  public override bespokeCanPlay(player: IPlayer) {
    return this.solariumSpace(player) !== undefined && SpaceSolarium.reservedCitySpaces(player).length > 0;
  }

  public override bespokePlay(player: IPlayer) {
    const solarium = this.solariumSpace(player);
    if (solarium === undefined) {
      return undefined;
    }
    return new SelectSpace('Select the reserved city area the Space Solarium is next to', SpaceSolarium.reservedCitySpaces(player))
      .andThen((city) => {
        player.game.addTile(player, solarium, {tileType: TileType.GREENERY, card: this.name, nextTo: city.id});
        player.game.increaseOxygenLevel(player, 1);
        return undefined;
      });
  }
}
