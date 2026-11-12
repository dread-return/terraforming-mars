/**
 * Individual global parameter tracks (Epic rulebook, p. 10): every player keeps a marker on a track for their
 * own contribution to oxygen, temperature, oceans and cities.
 */

export const INDIVIDUAL_TRACK_NAMES = ['oxygen', 'temperature', 'oceans', 'cities'] as const;
export type IndividualTrackName = typeof INDIVIDUAL_TRACK_NAMES[number];

/**
 * What a spot on a track gives the first time a player's marker reaches it.
 *
 * `postlude` is drawn but gives nothing yet because Postludes are not in the game.
 * `milestoneAward` gives one extra milestone claim or award funding, usable even when all the regular ones are taken.
 */
export const INDIVIDUAL_TRACK_REWARDS = ['postlude', 'plantProduction', 'heatProduction', 'steelProduction', 'ocean', 'milestoneAward'] as const;
export type IndividualTrackReward = typeof INDIVIDUAL_TRACK_REWARDS[number];

/** The resource the leader(s) of a track get from the World Government in each production phase. */
export type LeaderReward = {
  resource: 'plants' | 'heat' | 'steel' | 'megacredits',
  count: number,
};

export type IndividualTrackSpec = {
  /** The number of steps. A marker stops at the last one. */
  length: number,
  /** Reward spots, by step number. */
  rewards: ReadonlyArray<{step: number, reward: IndividualTrackReward}>,
  leaderReward: LeaderReward,
};

/** The three-VP bonus the leader(s) of each track get at the end of the game. */
export const LEADER_VICTORY_POINTS = 3;

export const INDIVIDUAL_TRACKS: Readonly<Record<IndividualTrackName, IndividualTrackSpec>> = {
  oxygen: {
    length: 13,
    rewards: [
      {step: 3, reward: 'postlude'},
      {step: 7, reward: 'plantProduction'},
      {step: 11, reward: 'milestoneAward'},
    ],
    leaderReward: {resource: 'plants', count: 1},
  },
  temperature: {
    length: 15,
    rewards: [
      {step: 3, reward: 'postlude'},
      {step: 6, reward: 'heatProduction'},
      {step: 10, reward: 'heatProduction'},
      {step: 13, reward: 'milestoneAward'},
    ],
    leaderReward: {resource: 'heat', count: 1},
  },
  oceans: {
    length: 12,
    rewards: [
      {step: 3, reward: 'postlude'},
      {step: 7, reward: 'ocean'},
      {step: 10, reward: 'milestoneAward'},
    ],
    leaderReward: {resource: 'megacredits', count: 2},
  },
  cities: {
    length: 12,
    rewards: [
      {step: 3, reward: 'postlude'},
      {step: 7, reward: 'steelProduction'},
      {step: 11, reward: 'milestoneAward'},
    ],
    leaderReward: {resource: 'steel', count: 1},
  },
};
