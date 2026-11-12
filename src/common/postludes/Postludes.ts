import {CardName} from '../cards/CardName';

/**
 * Postludes (Epic rulebook, p. 31): special project cards that upgrade a city, a greenery or an ocean.
 *
 * A postlude is gained from one of seven spaces on the board that start with a limited number of silver cubes,
 * or by funding an award, which has no limit.
 */

/** The spaces on the board where a postlude can be gained. Each one has its own pile of silver cubes. */
export const POSTLUDE_SOURCES = ['oxygen', 'temperature', 'oceans', 'cities', 'tr25', 'tr35', 'generation7'] as const;
export type PostludeSource = typeof POSTLUDE_SOURCES[number];

/** Something that gives a postlude but never runs out. */
export type PostludeReason = PostludeSource | 'award';

/** The four individual tracks give a postlude at their third step. */
export const TRACK_POSTLUDE_STEP = 3;
export const TR_POSTLUDE_THRESHOLDS = {tr25: 25, tr35: 35} as const;
export const POSTLUDE_GENERATION = 7;

/** Cards drawn when a postlude is gained: one is kept and the rest are discarded. */
export const POSTLUDE_DRAW_COUNT = 4;
/** M€ for each postlude sold with the Sell Postludes action. */
export const POSTLUDE_SELL_VALUE = 3;

/** What a postlude is placed on. */
export type PostludeKind = 'city' | 'greenery' | 'ocean';

/**
 * Every postlude card, in the order of their printed numbers (L01-L42).
 * Ore Refinery needs the Infrastructure tag of High Orbit, so it is not dealt yet.
 */
export const POSTLUDE_CARD_NAMES: ReadonlyArray<CardName> = [
  CardName.ASTRO_UNIVERSITY,
  CardName.CITY_PROJECT_LIBRARY,
  CardName.DELUXE_WATERFRONT_RESORT,
  CardName.FLIGHT_ACADEMY,
  CardName.FOOD_PROCESSING_UNIT,
  CardName.INSURANCE_HQ,
  CardName.MACHINERY_FACTORY,
  CardName.MARS_CASINO,
  CardName.MARS_HOSPITAL,
  CardName.METALLURGY_WORKSHOP,
  CardName.MINERAL_REFINERY,
  CardName.MINING_DEPOT,
  CardName.NANO_PARTICLE_FACILITY,
  CardName.PHARMACEUTICAL_COMPANY,
  CardName.POWER_CONVERTER,
  CardName.RE_DEVELOPMENT_OFFICE,
  CardName.SCIENCE_INSTITUTE,
  CardName.BLACK_MARKET,
  CardName.AMUSEMENT_PARK,
  CardName.ANIMAL_FARM,
  CardName.CULTIVATION_BIODOME,
  CardName.PHOTOBIONIC_POWER_STATION,
  CardName.PROBIOTICS_FACILITY,
  CardName.UNIVERSAL_BIO_STORE,
  CardName.SOIL_ENRICHMENT_LAB,
  CardName.WASTE_PROCESSING_CENTRE,
  CardName.NATIONAL_GREEN_PARK,
  CardName.AQUATIC_LIFE_LABORATORY,
  CardName.CLOUD_GENERATOR,
  CardName.DEEP_SEA_MINING_RIG,
  CardName.FLOATING_THERMAL_PLANT,
  CardName.HYDRAULIC_POWER_PLANT,
  CardName.MARINE_AQUARIUM,
  CardName.MOBILE_LAUNCH_STATION,
  CardName.OCEAN_GREEN_FARM,
  CardName.ORE_REFINERY,
  CardName.RESEARCH_WATCHTOWER,
  CardName.SEA_ORBITER,
  CardName.UNDERWATER_RESORT,
  CardName.SPORT_DIVING_SCHOOL,
  CardName.WATER_RECYCLE_COMPLEX,
  CardName.SKY_ELEVATOR,
];

/** Postludes that are in the game's data but never dealt. */
export const HELD_OUT_POSTLUDES: ReadonlySet<CardName> = new Set([CardName.ORE_REFINERY]);

const NAMES = new Set<CardName>(POSTLUDE_CARD_NAMES);

export function isPostludeName(name: CardName): boolean {
  return NAMES.has(name);
}

/** The name of the board tile image and CSS class for a postlude: 'Re-Development Office' is 're-development-office'. */
export function postludeSlug(name: CardName): string {
  return String(name).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}
