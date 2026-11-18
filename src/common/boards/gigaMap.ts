import {SpaceBonus} from './SpaceBonus';
import {SpaceId, isSpaceId, safeCast} from '../Types';

/**
 * The Mars map of the fan GIGA expansion's board (TM_GIGA_MAX_ENG_v2), shared by the server, which
 * builds the board from it, and the client, which draws the printed board art and only adds the
 * bonuses that are not printed on it.
 *
 * The map is an ellipse of 175 hexes in 11 rows. Rows are offset like a brick wall: every odd row is
 * shifted half a hex to the right. A hex is addressed by its row and its column, where column 0 is
 * the first hex of the top row and columns can be negative.
 *
 * Spaces are numbered 1 to 175 in reading order, matching the numbers printed on the board.
 */

/** What a hex is. Polar hexes (the snowflakes) and Noctis City are land. Volcanic hexes have a red border. */
export type GigaSpaceKind = 'ocean' | 'land' | 'volcanic' | 'polar' | 'noctis';

export type GigaSpace = {
  id: SpaceId;
  row: number;
  column: number;
  kind: GigaSpaceKind;
  bonus: ReadonlyArray<SpaceBonus>;
};

const KINDS: Record<string, GigaSpaceKind> = {
  o: 'ocean',
  l: 'land',
  v: 'volcanic',
  p: 'polar',
  n: 'noctis',
};

const BONUSES: Record<string, SpaceBonus> = {
  TI: SpaceBonus.TITANIUM,
  ST: SpaceBonus.STEEL,
  PL: SpaceBonus.PLANT,
  CA: SpaceBonus.DRAW_CARD,
  HE: SpaceBonus.HEAT,
  // Pay 5 M€ to place an ocean (like the bottom space of Hellas, which costs 6 M€).
  OC: SpaceBonus.OCEAN,
  M5: SpaceBonus.INCENTIVE_5MC,
};

/**
 * Each row: the column of its first hex, then its hexes left to right. A hex is its kind letter,
 * optionally followed by `:` and comma-separated bonuses (TI titanium, ST steel, PL plant, CA card,
 * HE heat, OC ocean for 5 M€, M5 5 M€).
 */
const ROWS: ReadonlyArray<[number, string]> = [
  // 1-12
  [0, 'o o:TI,CA o l:ST p:ST p:HE,HE p:HE,CA p:HE,HE l:ST o o o'],
  // 13-27
  [-2, 'o o:PL l:PL l:PL,PL o:PL o:PL p p p o o o o:ST o:TI,TI o'],
  // 28-43
  [-2, 'o l:PL l:ST,ST l:PL l:PL l:PL,PL o:CA o:PL,PL o:PL,PL o:PL,PL o:PL,PL o:PL,PL o:ST o:CA,CA o:TI o'],
  // 44-60 (47 Alba Mons, 59 and 60 the volcanoes north of Elysium)
  [-3, 'o:PL v:PL l:ST v:TI l l:PL,PL o:CA,CA o:PL,PL l:PL,PL l:PL l:PL l:PL,PL o:PL,PL o:ST o:ST v:PL v:TI,TI'],
  // 61-78 (62 Olympus Mons, 64 Ascraeus Mons, 65 Tharsis Tholus, 77 Elysium Mons)
  [-3, 'o:PL,PL v:CA,CA,CA v:ST v:CA v:M5 l o:PL,PL o:PL,PL l:PL l:CA,CA l l l:PL o:TI,CA o:PL,PL o:PL,PL v:ST,ST l:PL'],
  // 79-97 (82 Pavonis Mons)
  [-4, 'o:PL,PL o:PL,PL v:PL v:PL,TI l:PL,PL l:PL l:PL o:PL,PL l:PL l l l l l:PL l:PL l:PL o:PL,PL o:PL,PL o:PL,PL'],
  // 98-115 (100 Arsia Mons, 101 Noctis City)
  [-3, 'l:PL l:PL v:TI,CA n:PL,PL l:PL,PL l:PL,PL l:PL,PL l:PL,PL l l:ST l:ST l l:PL,PL l:PL l:PL l:PL l:PL,PL l:PL,PL'],
  // 116-132
  [-3, 'l l l l:ST l l:PL l:PL l l:ST l:ST,ST l:ST o:PL o:PL l:PL l l:CA l:CA'],
  // 133-148
  [-2, 'l:ST,TI l l:ST l:ST,ST l:PL o:PL,PL o:CA,CA l l:ST l o:TI o:CA,CA,CA o:PL,PL l l:ST l:ST,ST'],
  // 149-163
  [-2, 'l l l:CA l:CA l:ST o:TI,TI l:HE,HE l:ST l:HE,HE l:PL o:HE,HE o:TI l l l:ST'],
  // 164-175
  [0, 'l l l l l:HE,HE l:OC l:TI l:HE,HE l l l:TI l'],
];

function parse(): ReadonlyArray<GigaSpace> {
  const spaces: Array<GigaSpace> = [];
  ROWS.forEach(([first, cells], row) => {
    cells.split(' ').forEach((cell, idx) => {
      const [kindCode, bonusCodes] = cell.split(':');
      const kind = KINDS[kindCode];
      if (kind === undefined) {
        throw new Error(`Bad GIGA map cell ${cell}`);
      }
      const bonus = bonusCodes === undefined ? [] : bonusCodes.split(',').map((code) => {
        const b = BONUSES[code];
        if (b === undefined) {
          throw new Error(`Bad GIGA map bonus ${code}`);
        }
        return b;
      });
      spaces.push({id: gigaSpaceId(spaces.length + 1), row, column: first + idx, kind, bonus});
    });
  });
  return spaces;
}

/** Returns the space id of the `n`th space (1 to 175), '01' to '175'. */
export function gigaSpaceId(n: number): SpaceId {
  return safeCast(n.toString().padStart(2, '0'), isSpaceId);
}

/** The 175 spaces of the GIGA map, in reading order. */
export const GIGA_SPACES: ReadonlyArray<GigaSpace> = parse();

/** The lowest column on the map (the first hex of the widest row). */
export const GIGA_MIN_COLUMN = Math.min(...GIGA_SPACES.map((s) => s.column));

/** The bonuses printed on each space of the GIGA board art. */
export const GIGA_PRINTED_BONUSES: ReadonlyMap<SpaceId, ReadonlyArray<SpaceBonus>> = new Map(GIGA_SPACES.map((s) => [s.id, s.bonus]));

/** Noctis City's reserved space. */
export const GIGA_NOCTIS_CITY: SpaceId = gigaSpaceId(GIGA_SPACES.findIndex((s) => s.kind === 'noctis') + 1);

/** The polar spaces, marked with a snowflake on the board. */
export const GIGA_POLAR_SPACES: ReadonlyArray<SpaceId> = GIGA_SPACES.filter((s) => s.kind === 'polar').map((s) => s.id);

/** Placing a tile on the space with the ocean bonus costs this much for the extra ocean. */
export const GIGA_BONUS_OCEAN_COST = 5;
