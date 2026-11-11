import {CardName} from '../cards/CardName';
import {TileType} from '../TileType';

/**
 * The kinds of industry (GIGA Industries). Each one is a standard project that places an industry
 * tile, raises one production by 1, and distributes resources onto areas next to the tile.
 */
export const INDUSTRY_KINDS = ['money', 'heat', 'energy', 'steel', 'plant', 'titanium', 'random'] as const;
export type IndustryKind = typeof INDUSTRY_KINDS[number];

export const INDUSTRY_STANDARD_PROJECT: Readonly<Record<IndustryKind, CardName>> = {
  money: CardName.MONEY_INDUSTRY_STANDARD_PROJECT,
  heat: CardName.HEAT_INDUSTRY_STANDARD_PROJECT,
  energy: CardName.ENERGY_INDUSTRY_STANDARD_PROJECT,
  steel: CardName.STEEL_INDUSTRY_STANDARD_PROJECT,
  plant: CardName.PLANT_INDUSTRY_STANDARD_PROJECT,
  titanium: CardName.TITANIUM_INDUSTRY_STANDARD_PROJECT,
  random: CardName.RANDOM_INDUSTRY_STANDARD_PROJECT,
};

export const INDUSTRY_STANDARD_PROJECTS: ReadonlySet<CardName> = new Set(Object.values(INDUSTRY_STANDARD_PROJECT));

export const INDUSTRY_TILE: Readonly<Record<IndustryKind, TileType>> = {
  money: TileType.INDUSTRY_MONEY,
  heat: TileType.INDUSTRY_HEAT,
  energy: TileType.INDUSTRY_ENERGY,
  steel: TileType.INDUSTRY_STEEL,
  plant: TileType.INDUSTRY_PLANT,
  titanium: TileType.INDUSTRY_TITANIUM,
  random: TileType.INDUSTRY_RANDOM,
};

/** M€ cost of each industry, as printed on the GIGA board. */
export const INDUSTRY_COST: Readonly<Record<IndustryKind, number>> = {
  money: 8,
  heat: 8,
  energy: 10,
  steel: 10,
  plant: 14,
  titanium: 14,
  random: 18,
};

/**
 * Resources distributed onto the areas next to a new industry tile, as printed on the tile. Every
 * industry splits its resources over two areas, except the random industry, which places 1 resource
 * of the player's choice on a single area.
 */
export const INDUSTRY_RESOURCES: Readonly<Record<IndustryKind, number>> = {
  money: 4,
  heat: 4,
  energy: 3,
  steel: 3,
  plant: 2,
  titanium: 2,
  random: 1,
};

/** The most industries one player may own on the GIGA board. */
export const GIGA_BOARD_MAX_INDUSTRIES = 13;

/** The most industries one player may own on every other board. */
export const MAX_INDUSTRIES = 5;

/** Industry track step at which a player draws a project card. */
export const INDUSTRY_TRACK_CARD_STEP = 4;

/** Industry track step at which a player gains a prelude. */
export const INDUSTRY_TRACK_PRELUDE_STEP = 9;
