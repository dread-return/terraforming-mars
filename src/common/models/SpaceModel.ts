import {Color} from '../Color';
import {TileType} from '../TileType';
import {SpaceBonus} from '../boards/SpaceBonus';
import {SpaceType} from '../boards/SpaceType';
import {SpaceId} from '../Types';
import {UndergroundResourceToken} from '../underworld/UndergroundResourceToken';
import {SpaceCube} from '../boards/SpaceCube';
import {CardName} from '../cards/CardName';
import {TileUpgrade} from '../domesWilderness/DomesWilderness';

export type SpaceHighlight = undefined | 'noctis' | 'volcanic';

export type SpaceModel = {
  id: SpaceId;
  a9?: string;
  spaceType: SpaceType;
  bonus: Array<SpaceBonus>;
  color?: Color;
  tileType?: TileType;
  /** A dome on a city or a wilderness on a greenery. Absent when the tile has no upgrade. */
  upgrade?: TileUpgrade;
  /** The postlude card on top of this tile. Absent when there is none. */
  postlude?: CardName;
  cube?: SpaceCube;
  highlight?: SpaceHighlight;
  rotated?: true; // Absent or true
  gagarin?: number; // 0 means current
  cathedral?: true; // Absent or true
  nomads?: true; // Absent or true
  jellyfish?: true; // Eternity's Jellyfish Farms marks its ocean with an animal tag. Absent or true
  coOwner?: Color;

  undergroundResource?: UndergroundResourceToken;
  excavator?: Color;
}
