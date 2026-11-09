import {Board} from '../boards/Board';
import {Space} from '../boards/Space';
import {IPlayer} from '../IPlayer';
import {SpaceBonus} from '../../common/boards/SpaceBonus';
import {SpaceType} from '../../common/boards/SpaceType';
import {NamedVenusSpaces} from '../../common/venus2/NamedVenusSpaces';
import {SpaceId, isSpaceId, safeCast} from '../../common/Types';
import {Random} from '../../common/utils/Random';
import {inplaceShuffle} from '../utils/shuffle';

const RESERVED: ReadonlyArray<SpaceId> = [NamedVenusSpaces.STRATOPOLIS, NamedVenusSpaces.MAXWELL_BASE];
const TILES_PER_ROW = [4, 5, 6, 5, 6, 5, 4];

/** Row.position labels (e.g. '3.3' for Stratopolis), shown in coordinate view. */
const VENUS_A9: Partial<Record<SpaceId, string>> = {};
{
  let idx = 1;
  TILES_PER_ROW.forEach((count, row) => {
    for (let i = 1; i <= count; i++) {
      VENUS_A9[safeCast('v' + (idx++).toString().padStart(2, '0'), isSpaceId)] = `${row + 1}.${i}`;
    }
  });
}

/**
 * The Venus map from the GIGA board (Venus Phase 2). Same shape as The Moon:
 * 35 hexes in rows of 4-5-6-5-6-5-4.
 *
 * Yellow areas (the 12 heat spaces) are reserved for Gas Mines. Stratopolis and
 * Maxwell Base are reserved for those cards' cities.
 */
export class VenusBoard extends Board {
  public readonly A9 = VENUS_A9;

  public static isReserved(space: Space): boolean {
    return RESERVED.includes(space.id);
  }

  private available(player: IPlayer, spaceType: SpaceType): ReadonlyArray<Space> {
    return this.spaces.filter((space) =>
      space.spaceType === spaceType &&
      space.tile === undefined &&
      !VenusBoard.isReserved(space) &&
      (space.player === undefined || space.player.id === player.id));
  }

  /** Spaces for Floating Arrays, Venus Habitats and cities on Venus. */
  public override getAvailableSpacesOnLand(player: IPlayer): ReadonlyArray<Space> {
    return this.available(player, SpaceType.LAND);
  }

  /** Yellow spaces, for Gas Mines only. */
  public getAvailableSpacesForGasMine(player: IPlayer): ReadonlyArray<Space> {
    return this.available(player, SpaceType.VENUS_GAS_MINE);
  }

  /**
   * @param shuffle 'Randomize tiles' was ticked. The yellow areas move with their heat
   * bonuses, so Gas Mines still go on heat spaces; the reserved spaces stay put.
   */
  public static newInstance(shuffle?: Random): VenusBoard {
    const HEAT = SpaceBonus.HEAT;
    const ENERGY = SpaceBonus.ENERGY;
    const CARD = SpaceBonus.DRAW_CARD;

    const b = new Builder();
    b.row().gas(HEAT).land().land(ENERGY).land();
    b.row().land().land().gas(HEAT).gas(HEAT, HEAT, HEAT).land(ENERGY);
    b.row().land(CARD, CARD).gas(HEAT, HEAT).land(/* Stratopolis */).land(ENERGY).gas(HEAT).land();
    b.row().gas(HEAT).land().land().land(ENERGY).land();
    b.row().land(ENERGY, ENERGY).land(ENERGY).gas(HEAT, HEAT).land(ENERGY).land(/* Maxwell Base */).gas(HEAT, HEAT);
    b.row().land().gas(HEAT).gas(HEAT).land(ENERGY).gas(HEAT, HEAT);
    b.row().land(ENERGY, CARD).gas(HEAT).land().land(CARD, CARD);
    const spaces = b.build();
    if (shuffle !== undefined) {
      VenusBoard.shuffle(spaces, shuffle);
    }
    return new VenusBoard(spaces);
  }

  private static shuffle(spaces: Array<Space>, rng: Random) {
    const movable = spaces.filter((space) => !RESERVED.includes(space.id));
    const layouts = movable.map((space) => ({spaceType: space.spaceType, bonus: space.bonus}));
    inplaceShuffle(layouts, rng);
    movable.forEach((space, idx) => {
      space.spaceType = layouts[idx].spaceType;
      space.bonus = layouts[idx].bonus;
    });
  }
}

class Builder {
  spaceTypes: Array<SpaceType> = [];
  bonuses: Array<Array<SpaceBonus>> = [];

  public row(): Row {
    return new Row(this);
  }

  public build(): Array<Space> {
    const spaces: Array<Space> = [];
    const tilesPerRow = TILES_PER_ROW;
    let idx = 0;
    for (let row = 0; row < tilesPerRow.length; row++) {
      const tilesInThisRow = tilesPerRow[row];
      // Same coordinate convention as The Moon (MoonBoard).
      const xOffset = row === 3 ? 0 : 6 - tilesInThisRow;
      for (let i = 0; i < tilesInThisRow; i++) {
        spaces.push({
          id: Builder.spaceId(idx + 1),
          spaceType: this.spaceTypes[idx],
          x: xOffset + i,
          y: row,
          bonus: this.bonuses[idx],
          edge: false,
        });
        idx++;
      }
    }
    return spaces;
  }

  private static spaceId(id: number): SpaceId {
    return safeCast('v' + id.toString().padStart(2, '0'), isSpaceId);
  }
}

class Row {
  constructor(private builder: Builder) {}

  land(...bonuses: Array<SpaceBonus>): this {
    this.builder.spaceTypes.push(SpaceType.LAND);
    this.builder.bonuses.push(bonuses);
    return this;
  }

  gas(...bonuses: Array<SpaceBonus>): this {
    this.builder.spaceTypes.push(SpaceType.VENUS_GAS_MINE);
    this.builder.bonuses.push(bonuses);
    return this;
  }
}
