import {CardName} from '../cards/CardName';
import {TileType} from '../TileType';

/**
 * The two upgrades of Domes and Wilderness (Epic): a dome goes on top of a city, a wilderness on top of a greenery.
 */
export const TILE_UPGRADES = ['dome', 'wilderness'] as const;
export type TileUpgrade = typeof TILE_UPGRADES[number];

/** M€ cost of each upgrade as a standard project. */
export const UPGRADE_COST: Readonly<Record<TileUpgrade, number>> = {
  dome: 20,
  wilderness: 23,
};

export const UPGRADE_STANDARD_PROJECT: Readonly<Record<TileUpgrade, CardName>> = {
  dome: CardName.DOME_STANDARD_PROJECT,
  wilderness: CardName.WILDERNESS_STANDARD_PROJECT,
};

/** The tile art for each upgrade. */
export const UPGRADE_TILE: Readonly<Record<TileUpgrade, TileType>> = {
  dome: TileType.DOME,
  wilderness: TileType.WILDERNESS,
};
