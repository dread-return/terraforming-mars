import {BoardName} from './BoardName';
import {Expansion} from '../cards/GameModule';
import * as constants from '@/common/constants';

/**
 * The maximum values of the four Mars global parameters, and how far one step moves each.
 */
export type GlobalParameterMaximums = {
  oceans: number;
  temperature: number;
  oxygen: number;
  venus: number;
  /** Degrees per temperature step: 2, or 1 on the GIGA board. */
  temperatureStep: number;
  /** Percent per oxygen step: 1, or 0.5 on the GIGA board. */
  oxygenStep: number;
  /**
   * Percent per Venus step: 2, or 1 on the GIGA board. Amazonis Planitia moves 1% per step past 30%,
   * see venusScale.ts.
   */
  venusStep: number;
};

const STANDARD_MAXIMUMS: GlobalParameterMaximums = {
  oceans: constants.MAX_OCEAN_TILES,
  temperature: constants.MAX_TEMPERATURE,
  oxygen: constants.MAX_OXYGEN_LEVEL,
  venus: constants.MAX_VENUS_SCALE,
  temperatureStep: 2,
  oxygenStep: 1,
  venusStep: 2,
};

const AMAZONIS_PLANITIA_MAXIMUMS: GlobalParameterMaximums = {
  ...STANDARD_MAXIMUMS,
  oceans: constants.MAX_OCEAN_TILES_AMAZONIS,
  temperature: constants.MAX_TEMPERATURE_AMAZONIS,
  oxygen: constants.MAX_OXYGEN_LEVEL_AMAZONIS,
  venus: constants.MAX_VENUS_SCALE_AMAZONIS,
};

// The GIGA board keeps the scales but halves the steps: -30 to +10 °C in 40 steps, 0 to 15% oxygen in
// 30 steps, 0 to 30% Venus in 30 steps, and 21 oceans.
const GIGA_MAXIMUMS: GlobalParameterMaximums = {
  oceans: constants.MAX_OCEAN_TILES_GIGA,
  temperature: constants.MAX_TEMPERATURE_GIGA,
  oxygen: constants.MAX_OXYGEN_LEVEL_GIGA,
  venus: constants.MAX_VENUS_SCALE_GIGA,
  temperatureStep: 1,
  oxygenStep: 0.5,
  venusStep: 1,
};

/**
 * Returns the maximums for the map `boardName`.
 *
 * `venusPhase2Track` is true when Venus Phase 2 is in play, whose 24-step Venus track (to 48%)
 * replaces the map's own. The GIGA board keeps its own Venus track.
 */
export function getGlobalParameterMaximums(boardName: BoardName, venusPhase2Track: boolean = false): Readonly<GlobalParameterMaximums> {
  switch (boardName) {
  case BoardName.GIGA:
    return GIGA_MAXIMUMS;
  case BoardName.AMAZONIS_PLANITIA:
    return withVenusPhase2Track(AMAZONIS_PLANITIA_MAXIMUMS, venusPhase2Track);
  default:
    return withVenusPhase2Track(STANDARD_MAXIMUMS, venusPhase2Track);
  }
}

/**
 * Whether a game with these expansions on this board uses Venus Phase 2's 24-step Venus track. The
 * GIGA board's own 30-step track takes its place.
 */
export function hasVenusPhase2Track(expansions: Partial<Record<Expansion, boolean>>, boardName?: BoardName): boolean {
  return expansions.venusphase2 === true && expansions.venus === true && boardName !== BoardName.GIGA;
}

/** Returns `maximums` with the Venus Phase 2 Venus maximum when `venusPhase2Track` is true. */
export function withVenusPhase2Track(maximums: Readonly<GlobalParameterMaximums>, venusPhase2Track: boolean): Readonly<GlobalParameterMaximums> {
  return venusPhase2Track ? {...maximums, venus: constants.MAX_VENUS_SCALE_VENUS_PHASE_2} : maximums;
}
