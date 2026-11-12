import {CardName} from '../common/cards/CardName';
import {TileType} from '../common/TileType';
import {TileUpgrade} from '../common/domesWilderness/DomesWilderness';

export type Tile = {
  tileType: TileType;
  card?: CardName;

  protectedHazard?: boolean; // For Desperate Measures
  rotated?: boolean; // For Crashlanding
  covers?: Tile; // For Ares tiles
  upgrade?: TileUpgrade; // Domes and Wilderness: a dome on a city, a wilderness on a greenery
  postlude?: CardName; // Postludes: the postlude card sitting on top of this city, greenery or ocean
}
