import {SpaceBonus} from '../../common/boards/SpaceBonus';
import {SpaceType} from '../../common/boards/SpaceType';
import {BoardName} from '../../common/boards/BoardName';
import {SpaceId} from '../../common/Types';
import {getGlobalParameterMaximums} from '../../common/boards/GlobalParameterMaximums';
import {GIGA_BONUS_OCEAN_COST, GIGA_MIN_COLUMN, GIGA_NOCTIS_CITY, GIGA_POLAR_SPACES, GIGA_SPACES} from '../../common/boards/gigaMap';
import {SpaceName} from '../../common/boards/SpaceName';
import {Random} from '../../common/utils/Random';
import {GameOptions} from '../game/GameOptions';
import {colonySpace, expansionColonySpaces} from './BoardBuilder';
import {SpaceCosts} from './Board';
import {MarsBoard} from './MarsBoard';
import {Space} from './Space';

// Each space is labelled with the number printed on the board.
const GIGA_A9: Partial<Record<SpaceId, string>> = Object.fromEntries(GIGA_SPACES.map((s) => [s.id, String(Number(s.id))]));

/**
 * The fan GIGA expansion's board: an ellipse of 175 hexes, about three times a normal map, with
 * 55 spaces reserved for oceans, 12 volcanic spaces and 7 polar spaces.
 *
 * Rows are offset like a brick wall rather than forming a hexagon, so adjacency is computed here: a
 * space's `x` is its column (shifted to start at 0) and every odd row sits half a hex to the right.
 *
 * The map is not shuffled: the client draws the printed board art under the spaces.
 */
export class GigaBoard extends MarsBoard {
  public override readonly A9 = GIGA_A9;
  /** Card ocean requirements are doubled on this board. */
  public override readonly oceanRequirementMultiplier = 2;

  public static newInstance(gameOptions: GameOptions, _rng: Random): GigaBoard {
    const spaces: Array<Space> = [
      colonySpace(SpaceName.GANYMEDE_COLONY),
      colonySpace(SpaceName.PHOBOS_SPACE_HAVEN),
    ];
    const marsSpaces: Array<Space> = GIGA_SPACES.map((s) => {
      const space: Space = {
        id: s.id,
        spaceType: s.kind === 'ocean' ? SpaceType.OCEAN : SpaceType.LAND,
        x: s.column - GIGA_MIN_COLUMN,
        y: s.row,
        bonus: [...s.bonus],
        edge: false,
      };
      if (s.kind === 'volcanic') {
        space.volcanic = true;
      }
      return space;
    });
    // A space is on the edge when one of its six neighbours is off the map.
    for (const space of marsSpaces) {
      const neighbours = GigaBoard.neighbourCoordinates(space).filter(([x, y]) => marsSpaces.some((s) => s.x === x && s.y === y));
      (space as {edge: boolean}).edge = neighbours.length < 6;
    }
    spaces.push(...marsSpaces);
    spaces.push(...expansionColonySpaces(gameOptions));
    return new GigaBoard(spaces);
  }

  public constructor(spaces: ReadonlyArray<Space>) {
    super(spaces, GIGA_NOCTIS_CITY, getGlobalParameterMaximums(BoardName.GIGA));
  }

  /**
   * The coordinates of a space's neighbours, clockwise from the top left. Odd rows are shifted half a
   * hex right, so their upper and lower neighbours share their column and the column to the right;
   * even rows' share their column and the column to the left.
   */
  private static neighbourCoordinates(space: {x: number, y: number}): Array<[number, number]> {
    const {x, y} = space;
    const shift = y % 2 === 1 ? 0 : -1;
    return [
      [x + shift, y - 1], // top left
      [x + shift + 1, y - 1], // top right
      [x + 1, y], // right
      [x + shift + 1, y + 1], // bottom right
      [x + shift, y + 1], // bottom left
      [x - 1, y], // left
    ];
  }

  protected override computeAdjacentSpaces(space: Space): ReadonlyArray<Space | undefined> {
    if (space.spaceType === SpaceType.COLONY) {
      return [];
    }
    return GigaBoard.neighbourCoordinates(space).map(([x, y]) =>
      this.spaces.find((adj) => adj.x === x && adj.y === y && adj.spaceType !== SpaceType.COLONY));
  }

  /** The polar spaces are the snowflake spaces at the top of the map. */
  public override isPolarSpace(space: Space): boolean {
    return GIGA_POLAR_SPACES.includes(space.id);
  }

  public override oceanBonusCost(): number {
    return GIGA_BONUS_OCEAN_COST;
  }

  public override spaceCosts(space: Space): SpaceCosts {
    const costs = super.spaceCosts(space);
    if (space.bonus.includes(SpaceBonus.OCEAN)) {
      costs.megacredits = GIGA_BONUS_OCEAN_COST;
      costs.tr.oceans = 1;
    }
    return costs;
  }
}
