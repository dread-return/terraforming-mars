import {MAX_VENUS_SCALE, MAX_VENUS_SCALE_VENUS_PHASE_2} from '../../common/constants';

const STEPS_TO_MAX_VENUS_SCALE = MAX_VENUS_SCALE / 2;

/**
 * The Venus scale moves 2% per step up to 30%. Past 30%, Amazonis Planitia moves 1% per step (to 33%),
 * while the Venus Phase 2 track keeps moving 2% per step (to 48%).
 *
 * `max` is the game's Venus maximum (`game.max.venus`), which selects between them.
 */
function twoPercentSteps(level: number, max: number): boolean {
  return level <= MAX_VENUS_SCALE || max === MAX_VENUS_SCALE_VENUS_PHASE_2;
}

/** Converts a Venus scale level to the number of steps from 0. */
export function venusLevelToSteps(level: number, max: number = MAX_VENUS_SCALE): number {
  if (twoPercentSteps(level, max)) {
    return level / 2;
  }
  return STEPS_TO_MAX_VENUS_SCALE + (level - MAX_VENUS_SCALE);
}

/** Converts the number of Venus steps from 0 to a Venus scale level. */
export function venusStepsToLevel(steps: number, max: number = MAX_VENUS_SCALE): number {
  if (steps <= STEPS_TO_MAX_VENUS_SCALE || max === MAX_VENUS_SCALE_VENUS_PHASE_2) {
    return steps * 2;
  }
  return MAX_VENUS_SCALE + (steps - STEPS_TO_MAX_VENUS_SCALE);
}

/**
 * Returns the Venus level after moving `steps` steps from `level`.
 *
 * `steps` can be negative.
 */
export function venusLevelAfterSteps(level: number, steps: number, max: number = MAX_VENUS_SCALE): number {
  return venusStepsToLevel(Math.max(0, venusLevelToSteps(level, max) + steps), max);
}

/** Returns the number of steps between `from` and `to`. */
export function venusStepsBetween(from: number, to: number, max: number = MAX_VENUS_SCALE): number {
  return venusLevelToSteps(to, max) - venusLevelToSteps(from, max);
}
