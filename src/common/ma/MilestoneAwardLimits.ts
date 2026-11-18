import {BoardName} from '../boards/BoardName';
import {AWARD_COSTS, MAX_AWARDS, MAX_MILESTONES} from '../constants';

/** How many milestones can be claimed and awards funded on a board, and what the awards cost. */
export type MilestoneAwardLimits = {
  maxMilestones: number;
  maxAwards: number;
  /** The cost of funding the first, second, ... award. */
  awardCosts: ReadonlyArray<number>;
};

const STANDARD: MilestoneAwardLimits = {
  maxMilestones: MAX_MILESTONES,
  maxAwards: MAX_AWARDS,
  awardCosts: AWARD_COSTS,
};

// The GIGA board has 7 claim spaces (8 M€ each) and 7 funding spaces (8 to 20 M€).
const GIGA: MilestoneAwardLimits = {
  maxMilestones: 7,
  maxAwards: 7,
  awardCosts: [8, 10, 12, 14, 16, 18, 20],
};

/** How many milestones and awards the GIGA board draws, of each. */
export const GIGA_MILESTONES_AWARDS_DRAWN = 10;

export function getMilestoneAwardLimits(boardName: BoardName): MilestoneAwardLimits {
  return boardName === BoardName.GIGA ? GIGA : STANDARD;
}

/**
 * The cost of funding the award after `fundedCount` awards are funded. Past the printed spaces (when
 * individual tracks grant an extra funding) costs keep rising by the same amount.
 */
export function awardFundingCost(limits: MilestoneAwardLimits, fundedCount: number): number {
  const costs = limits.awardCosts;
  if (fundedCount < costs.length) {
    return costs[fundedCount];
  }
  const last = costs.length - 1;
  const increment = costs[last] - costs[last - 1];
  return costs[last] + (fundedCount - last) * increment;
}
