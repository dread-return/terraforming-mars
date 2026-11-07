/**
 * The Nuclear (GIGA) contamination track. Every Radioactive tag played moves it up one step.
 * It gives no TR and does not affect the end of the game.
 */
export const CONTAMINATION_MAX = 19;

export type ContaminationReward = {nuclearZone: true} | {radiation: number};

/** What the player who moves the marker onto a step receives. */
export const CONTAMINATION_REWARDS: Readonly<Record<number, ContaminationReward>> = {
  3: {nuclearZone: true},
  5: {radiation: 1},
  7: {nuclearZone: true},
  9: {radiation: 1},
  11: {nuclearZone: true},
  13: {radiation: 2},
  15: {nuclearZone: true},
  17: {radiation: 2},
  19: {nuclearZone: true},
};

export function describeContaminationReward(reward: ContaminationReward): string {
  if ('nuclearZone' in reward) {
    return 'place a Nuclear Zone';
  }
  return reward.radiation === 1 ? 'add 1 radiation to a card' : `add ${reward.radiation} radiation to cards`;
}

/** The next step above `level` that has a reward, if any. */
export function nextContaminationReward(level: number): {step: number, reward: ContaminationReward} | undefined {
  for (let step = level + 1; step <= CONTAMINATION_MAX; step++) {
    const reward = CONTAMINATION_REWARDS[step];
    if (reward !== undefined) {
      return {step, reward};
    }
  }
  return undefined;
}
