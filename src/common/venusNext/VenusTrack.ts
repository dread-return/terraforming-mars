import * as constants from '../constants';
import {BoardName} from '../boards/BoardName';
import {getGlobalParameterMaximums} from '../boards/GlobalParameterMaximums';

/** A bonus printed on a Venus track, for the player who raises Venus onto (or past) its value. */
export type VenusTrackThresholdBonus = 'drawcard' | 'tr' | 'colony';

export type VenusTrackThreshold = {
  value: number;
  bonus: VenusTrackThresholdBonus;
};

/** The classic Venus track: a card at 8%, TR at 16%. */
export const STANDARD_VENUS_THRESHOLDS: ReadonlyArray<VenusTrackThreshold> = [
  {value: constants.VENUS_LEVEL_FOR_CARD_BONUS, bonus: 'drawcard'},
  {value: constants.VENUS_LEVEL_FOR_TR_BONUS, bonus: 'tr'},
];

export const AMAZONIS_PLANITIA_VENUS_THRESHOLDS: ReadonlyArray<VenusTrackThreshold> = [
  {value: constants.VENUS_LEVEL_FOR_CARD_BONUS, bonus: 'drawcard'},
  {value: constants.VENUS_LEVEL_FOR_AMAZONIS_COLONY_BONUS, bonus: 'colony'},
  {value: constants.VENUS_LEVEL_FOR_AMAZONIS_TR_BONUS, bonus: 'tr'},
];

/** The GIGA board's 1%-step track adds a colony at 24%. */
export const GIGA_VENUS_THRESHOLDS: ReadonlyArray<VenusTrackThreshold> = [
  {value: constants.VENUS_LEVEL_FOR_CARD_BONUS, bonus: 'drawcard'},
  {value: constants.VENUS_LEVEL_FOR_TR_BONUS, bonus: 'tr'},
  {value: constants.VENUS_LEVEL_FOR_GIGA_COLONY_BONUS, bonus: 'colony'},
];

/**
 * Venus Phase 2's 24-step track (to 48%): cards at 8% and 22%, TR at 34%. The standard and wild resources on its
 * last steps are granted by Game.increaseVenusScaleLevel, like the Alt. Venus board.
 */
export const VENUS_PHASE_2_VENUS_THRESHOLDS: ReadonlyArray<VenusTrackThreshold> = [
  {value: constants.VENUS_LEVEL_FOR_CARD_BONUS, bonus: 'drawcard'},
  {value: constants.VENUS_PHASE_2_LEVEL_FOR_SECOND_CARD_BONUS, bonus: 'drawcard'},
  {value: constants.VENUS_PHASE_2_LEVEL_FOR_TR_BONUS, bonus: 'tr'},
];

/** The Venus thresholds for a map. The Venus Phase 2 track replaces a map's own, except on the GIGA board. */
export function venusThresholds(boardName: BoardName, venusPhase2Track: boolean): ReadonlyArray<VenusTrackThreshold> {
  if (boardName === BoardName.GIGA) {
    return GIGA_VENUS_THRESHOLDS;
  }
  if (venusPhase2Track) {
    return VENUS_PHASE_2_VENUS_THRESHOLDS;
  }
  return boardName === BoardName.AMAZONIS_PLANITIA ? AMAZONIS_PLANITIA_VENUS_THRESHOLDS : STANDARD_VENUS_THRESHOLDS;
}

/** What a step of the Venus track shows: its printed bonuses, plus the Alt. Venus / Venus Phase 2 resources. */
export type VenusTrackSpotBonus = VenusTrackThresholdBonus | 'standardResource' | 'wildResource';

export type VenusTrackSpot = {
  value: number;
  bonuses: ReadonlyArray<VenusTrackSpotBonus>;
};

/**
 * Every value of the Venus track, from 0% to the map's maximum, with what reaching it gives. `venusPhase2Expansion`
 * is whether Venus Phase 2 (with Venus Next) is in the game.
 *
 * Mirrors Game.increaseVenusScaleLevel: each step above the minimum resource bonus (34% on the Venus Phase 2
 * track, 16% on the Alt. Venus board) gives a standard resource, and the last step a wild resource as well.
 */
export function venusTrackSpots(boardName: BoardName, venusPhase2Expansion: boolean, altVenusBoard: boolean): Array<VenusTrackSpot> {
  // The GIGA board keeps its own track (see hasVenusPhase2Track).
  const venusPhase2Track = venusPhase2Expansion && boardName !== BoardName.GIGA;
  const max = getGlobalParameterMaximums(boardName, venusPhase2Track);
  const values: Array<number> = [];
  for (let value = 0; value <= max.venus;) {
    values.push(value);
    // Amazonis Planitia moves 1% per step above 30% (unless Venus Phase 2 replaces its track).
    value += (max.venusStep === 1 || (value >= constants.MAX_VENUS_SCALE && max.venus !== constants.MAX_VENUS_SCALE_VENUS_PHASE_2)) ? 1 : 2;
  }
  const thresholds = venusThresholds(boardName, venusPhase2Track);
  const resourceFrom = venusPhase2Track ? constants.VENUS_PHASE_2_MINIMUM_RESOURCE_BONUS : altVenusBoard ? constants.ALT_VENUS_MINIMUM_BONUS : undefined;
  return values.map((value) => {
    const bonuses: Array<VenusTrackSpotBonus> = thresholds.filter((t) => t.value === value).map((t) => t.bonus);
    if (resourceFrom !== undefined && value > resourceFrom) {
      bonuses.push('standardResource');
      if (value === max.venus) {
        bonuses.push('wildResource');
      }
    }
    return {value, bonuses};
  });
}
