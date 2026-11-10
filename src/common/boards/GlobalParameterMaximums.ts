import {BoardName} from './BoardName';
import {Expansion} from '../cards/GameModule';
import * as constants from '@/common/constants';

/**
 * The maximum values of the four Mars global parameters.
 */
export type GlobalParameterMaximums = {
  oceans: number;
  temperature: number;
  oxygen: number;
  venus: number;
};

const STANDARD_MAXIMUMS: GlobalParameterMaximums = {
  oceans: constants.MAX_OCEAN_TILES,
  temperature: constants.MAX_TEMPERATURE,
  oxygen: constants.MAX_OXYGEN_LEVEL,
  venus: constants.MAX_VENUS_SCALE,
};

const AMAZONIS_PLANITIA_MAXIMUMS: GlobalParameterMaximums = {
  oceans: constants.MAX_OCEAN_TILES_AMAZONIS,
  temperature: constants.MAX_TEMPERATURE_AMAZONIS,
  oxygen: constants.MAX_OXYGEN_LEVEL_AMAZONIS,
  venus: constants.MAX_VENUS_SCALE_AMAZONIS,
};

/**
 * Returns the maximums for the map `boardName`.
 *
 * `venusPhase2Track` is true when Venus Phase 2 is in play, whose 24-step Venus track (to 48%)
 * replaces the map's own.
 */
export function getGlobalParameterMaximums(boardName: BoardName, venusPhase2Track: boolean = false): Readonly<GlobalParameterMaximums> {
  const maximums = boardName === BoardName.AMAZONIS_PLANITIA ? AMAZONIS_PLANITIA_MAXIMUMS : STANDARD_MAXIMUMS;
  return withVenusPhase2Track(maximums, venusPhase2Track);
}

/** Whether a game with these expansions uses Venus Phase 2's 24-step Venus track. */
export function hasVenusPhase2Track(expansions: Partial<Record<Expansion, boolean>>): boolean {
  return expansions.venusphase2 === true && expansions.venus === true;
}

/** Returns `maximums` with the Venus Phase 2 Venus maximum when `venusPhase2Track` is true. */
export function withVenusPhase2Track(maximums: Readonly<GlobalParameterMaximums>, venusPhase2Track: boolean): Readonly<GlobalParameterMaximums> {
  return venusPhase2Track ? {...maximums, venus: constants.MAX_VENUS_SCALE_VENUS_PHASE_2} : maximums;
}
