import {CardName} from '../cards/CardName';
import {Color} from '../Color';
import {Tag} from '../cards/Tag';

/**
 * High Orbit infrastructures, as adapted by the Epic rulebook (MEGA.pdf, printed p. 21, "Infrastructures").
 *
 * Infrastructures are silver cards that sit face up in three sections (satellites, ore-producing and advanced),
 * seven cards each. Each game uses two cards per section. Each card is a stack with one copy per player, so every card exists in
 * numbered copies: "Comsat", "Comsat (2)", ... "Comsat (6)".
 */
export const INFRASTRUCTURE_CATEGORIES = ['satellites', 'oreProducing', 'advanced'] as const;
export type InfrastructureCategory = typeof INFRASTRUCTURE_CATEGORIES[number];

export const INFRASTRUCTURE_CATEGORY_TITLES: Record<InfrastructureCategory, string> = {
  satellites: 'Satellites',
  oreProducing: 'Ore-producing',
  advanced: 'Advanced',
};

/** Planetary tags for Propellant Depot (the same list as Surveyors Team). */
export const PLANETARY_TAGS: ReadonlyArray<Tag> = [Tag.EARTH, Tag.VENUS, Tag.MARS, Tag.JOVIAN, Tag.MOON, Tag.MERCURY];

/** Cards dealt to each section at the start of the game (Leo: six in all, two per section). */
export const INFRASTRUCTURES_PER_CATEGORY = 2;

/** One copy per player; the game supports up to 6 players. */
export const MAX_INFRASTRUCTURE_COPIES = 6;

export type InfrastructureDesign = {
  /** The name of the first copy, which is also the name of the stack. */
  name: CardName;
  category: InfrastructureCategory;
  /** Cost in titanium. */
  cost: number;
  copies: ReadonlyArray<CardName>;
};

function design(category: InfrastructureCategory, cost: number, copies: Array<CardName>): InfrastructureDesign {
  if (copies.length !== MAX_INFRASTRUCTURE_COPIES) {
    throw new Error(`${copies[0]} needs ${MAX_INFRASTRUCTURE_COPIES} copies`);
  }
  return {name: copies[0], category, cost, copies};
}

export const INFRASTRUCTURE_DESIGNS: ReadonlyArray<InfrastructureDesign> = [
  // The Epic set (TM GIGA\\Infrastructures - 21). Its file names number the cards 1, 2 and 3, which matches
  // their titanium cost and their theme, so those are the three sections.
  // Satellites (1 titanium)
  design('satellites', 1, [CardName.COMSAT, CardName.COMSAT_2, CardName.COMSAT_3, CardName.COMSAT_4, CardName.COMSAT_5, CardName.COMSAT_6]),
  design('satellites', 1, [CardName.MOONSAT, CardName.MOONSAT_2, CardName.MOONSAT_3, CardName.MOONSAT_4, CardName.MOONSAT_5, CardName.MOONSAT_6]),
  design('satellites', 1, [CardName.NAVIGATIONAL_BEACON, CardName.NAVIGATIONAL_BEACON_2, CardName.NAVIGATIONAL_BEACON_3, CardName.NAVIGATIONAL_BEACON_4, CardName.NAVIGATIONAL_BEACON_5, CardName.NAVIGATIONAL_BEACON_6]),
  design('satellites', 1, [CardName.PROBE, CardName.PROBE_2, CardName.PROBE_3, CardName.PROBE_4, CardName.PROBE_5, CardName.PROBE_6]),
  design('satellites', 1, [CardName.SPYSAT, CardName.SPYSAT_2, CardName.SPYSAT_3, CardName.SPYSAT_4, CardName.SPYSAT_5, CardName.SPYSAT_6]),
  design('satellites', 1, [CardName.VENUS_SAT, CardName.VENUS_SAT_2, CardName.VENUS_SAT_3, CardName.VENUS_SAT_4, CardName.VENUS_SAT_5, CardName.VENUS_SAT_6]),
  design('satellites', 1, [CardName.WEATHER_SATELLITE, CardName.WEATHER_SATELLITE_2, CardName.WEATHER_SATELLITE_3, CardName.WEATHER_SATELLITE_4, CardName.WEATHER_SATELLITE_5, CardName.WEATHER_SATELLITE_6]),
  // Ore-producing (2 titanium): every one of them makes or uses ore
  design('oreProducing', 2, [CardName.ASTEROID_MINE, CardName.ASTEROID_MINE_2, CardName.ASTEROID_MINE_3, CardName.ASTEROID_MINE_4, CardName.ASTEROID_MINE_5, CardName.ASTEROID_MINE_6]),
  design('oreProducing', 2, [CardName.AUTO_FACTORY, CardName.AUTO_FACTORY_2, CardName.AUTO_FACTORY_3, CardName.AUTO_FACTORY_4, CardName.AUTO_FACTORY_5, CardName.AUTO_FACTORY_6]),
  design('oreProducing', 2, [CardName.FREIGHTERS, CardName.FREIGHTERS_2, CardName.FREIGHTERS_3, CardName.FREIGHTERS_4, CardName.FREIGHTERS_5, CardName.FREIGHTERS_6]),
  design('oreProducing', 2, [CardName.ORBITAL_SHIPYARD, CardName.ORBITAL_SHIPYARD_2, CardName.ORBITAL_SHIPYARD_3, CardName.ORBITAL_SHIPYARD_4, CardName.ORBITAL_SHIPYARD_5, CardName.ORBITAL_SHIPYARD_6]),
  design('oreProducing', 2, [CardName.PROPELLANT_DEPOT, CardName.PROPELLANT_DEPOT_2, CardName.PROPELLANT_DEPOT_3, CardName.PROPELLANT_DEPOT_4, CardName.PROPELLANT_DEPOT_5, CardName.PROPELLANT_DEPOT_6]),
  design('oreProducing', 2, [CardName.SALVAGE_DEPOT, CardName.SALVAGE_DEPOT_2, CardName.SALVAGE_DEPOT_3, CardName.SALVAGE_DEPOT_4, CardName.SALVAGE_DEPOT_5, CardName.SALVAGE_DEPOT_6]),
  design('oreProducing', 2, [CardName.SPACE_TRADING_STATION, CardName.SPACE_TRADING_STATION_2, CardName.SPACE_TRADING_STATION_3, CardName.SPACE_TRADING_STATION_4, CardName.SPACE_TRADING_STATION_5, CardName.SPACE_TRADING_STATION_6]),
  // Advanced (3 titanium): stations and facilities
  design('advanced', 3, [CardName.ASTEROID_OUTPOST, CardName.ASTEROID_OUTPOST_2, CardName.ASTEROID_OUTPOST_3, CardName.ASTEROID_OUTPOST_4, CardName.ASTEROID_OUTPOST_5, CardName.ASTEROID_OUTPOST_6]),
  design('advanced', 3, [CardName.HYDROPONICS, CardName.HYDROPONICS_2, CardName.HYDROPONICS_3, CardName.HYDROPONICS_4, CardName.HYDROPONICS_5, CardName.HYDROPONICS_6]),
  design('advanced', 3, [CardName.OBSERVATORY, CardName.OBSERVATORY_2, CardName.OBSERVATORY_3, CardName.OBSERVATORY_4, CardName.OBSERVATORY_5, CardName.OBSERVATORY_6]),
  design('advanced', 3, [CardName.ORBITAL_HEADQUARTERS, CardName.ORBITAL_HEADQUARTERS_2, CardName.ORBITAL_HEADQUARTERS_3, CardName.ORBITAL_HEADQUARTERS_4, CardName.ORBITAL_HEADQUARTERS_5, CardName.ORBITAL_HEADQUARTERS_6]),
  design('advanced', 3, [CardName.POWERSAT_STATION, CardName.POWERSAT_STATION_2, CardName.POWERSAT_STATION_3, CardName.POWERSAT_STATION_4, CardName.POWERSAT_STATION_5, CardName.POWERSAT_STATION_6]),
  design('advanced', 3, [CardName.SCIENCE_FACILITY, CardName.SCIENCE_FACILITY_2, CardName.SCIENCE_FACILITY_3, CardName.SCIENCE_FACILITY_4, CardName.SCIENCE_FACILITY_5, CardName.SCIENCE_FACILITY_6]),
  design('advanced', 3, [CardName.SPACE_HABITAT, CardName.SPACE_HABITAT_2, CardName.SPACE_HABITAT_3, CardName.SPACE_HABITAT_4, CardName.SPACE_HABITAT_5, CardName.SPACE_HABITAT_6]),
];

const DESIGN_OF = new Map<CardName, InfrastructureDesign>();
for (const d of INFRASTRUCTURE_DESIGNS) {
  for (const copy of d.copies) {
    DESIGN_OF.set(copy, d);
  }
}

/** The stack (design) a copy belongs to, or undefined when `name` is not an infrastructure. */
export function infrastructureDesign(name: CardName): InfrastructureDesign | undefined {
  return DESIGN_OF.get(name);
}

export function isInfrastructureName(name: CardName): boolean {
  return DESIGN_OF.has(name);
}

/** True for copies 2 to 6, which the card list hides. */
export function isInfrastructureCopy(name: CardName): boolean {
  const d = DESIGN_OF.get(name);
  return d !== undefined && d.name !== name;
}

/** Copy number, 1 to 6. */
export function infrastructureCopyNumber(name: CardName): number {
  const d = DESIGN_OF.get(name);
  return d === undefined ? 0 : d.copies.indexOf(name) + 1;
}

/** What the client needs to draw the Infrastructures menu. */
export type InfrastructureStackModel = {
  /** Name of the copy a player would get now (the stack's top card), or the first copy when the stack is empty. */
  card: CardName;
  remaining: number;
  /** Why this player cannot buy it right now, or undefined when they can. */
  disabledReason?: string;
};

export type InfrastructureSectorModel = {
  category: InfrastructureCategory;
  /** Color of the player whose cube sits on this section this generation. */
  usedBy?: Color;
  stacks: Array<InfrastructureStackModel>;
};
