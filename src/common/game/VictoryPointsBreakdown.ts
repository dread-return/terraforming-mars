import {Tag} from '../cards/Tag';

export type MADetail = {message: string, messageArgs?: Array<string>, victoryPoint: number};

export type VictoryPointsBreakdown = {
  terraformRating: number;
  milestones: number;
  awards: number;
  greenery: number;
  city: number;
  escapeVelocity: number;
  moonHabitats: number;
  moonMines: number;
  moonRoads: number;
  /** Venus Phase 2: Venus Habitats, Gas Mines and cities on Venus, 1 VP per adjacent Floating Array. */
  venusTiles: number;
  planetaryTracks: number;
  victoryPoints: number;
  total: number;
  detailsCards: ReadonlyArray<{cardName: string, victoryPoint: number}>;
  detailsMilestones: ReadonlyArray<MADetail>;
  detailsAwards: ReadonlyArray<MADetail>;
  detailsPlanetaryTracks: ReadonlyArray<{tag: Tag, points: number}>;
  // Total VP less than 0. For Underworld
  negativeVP: number;
}
