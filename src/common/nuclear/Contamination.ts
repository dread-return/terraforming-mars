/**
 * The Nuclear (GIGA) contamination track. Every Radioactive tag played moves it up one step.
 * It gives no TR and does not affect the end of the game.
 *
 * There are two versions, picked when the game is created:
 * - the standard track, from the GIGA board (0 to 19);
 * - the "Alt. Contamination track", from the picture in the GIGA rules (0 to 20).
 */
export type ContaminationReward =
  {nuclearZone: true} |
  {radiation: number} |
  {heat: number} |
  {energy: number} |
  {data: number} |
  {science: number};

export type ContaminationTrack = {
  /** The last step. The marker starts at 0. */
  max: number,
  /** What the player who moves the marker onto a step receives. */
  rewards: Readonly<Record<number, ContaminationReward>>,
};

/** From the GIGA board. */
export const CONTAMINATION_TRACK: ContaminationTrack = {
  max: 19,
  rewards: {
    3: {nuclearZone: true},
    5: {radiation: 1},
    7: {nuclearZone: true},
    9: {radiation: 1},
    11: {nuclearZone: true},
    13: {radiation: 2},
    15: {nuclearZone: true},
    17: {radiation: 2},
    19: {nuclearZone: true},
  },
};

/** From the picture of the track in the GIGA rules (Nuclear Expansion section). */
export const ALT_CONTAMINATION_TRACK: ContaminationTrack = {
  max: 20,
  rewards: {
    2: {heat: 1},
    4: {nuclearZone: true},
    6: {energy: 1},
    8: {nuclearZone: true},
    10: {radiation: 1},
    12: {nuclearZone: true},
    14: {data: 2},
    16: {nuclearZone: true},
    18: {science: 1},
    20: {radiation: 2},
  },
};

export function contaminationTrack(alt: boolean | undefined): ContaminationTrack {
  return alt === true ? ALT_CONTAMINATION_TRACK : CONTAMINATION_TRACK;
}

function plural(n: number, one: string, many: string) {
  return n === 1 ? `${n} ${one}` : `${n} ${many}`;
}

export function describeContaminationReward(reward: ContaminationReward): string {
  if ('nuclearZone' in reward) {
    return 'place a Nuclear Zone';
  } else if ('radiation' in reward) {
    return `add ${reward.radiation} radiation to ANY card`;
  } else if ('heat' in reward) {
    return `gain ${reward.heat} heat`;
  } else if ('energy' in reward) {
    return `gain ${reward.energy} energy`;
  } else if ('data' in reward) {
    return `add ${reward.data} data to ANY card`;
  } else {
    return `add ${plural(reward.science, 'science resource', 'science resources')} to ANY card`;
  }
}

/** The next step above `level` that has a reward, if any. */
export function nextContaminationReward(track: ContaminationTrack, level: number): {step: number, reward: ContaminationReward} | undefined {
  for (let step = level + 1; step <= track.max; step++) {
    const reward = track.rewards[step];
    if (reward !== undefined) {
      return {step, reward};
    }
  }
  return undefined;
}
