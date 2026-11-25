import {Color} from '../Color';
import {MilestoneName} from '../ma/MilestoneName';

export type MilestoneScore = {
  color: Color;
  score: number;
  claimable: boolean;
}

export type ClaimedMilestoneModel = {
  name: MilestoneName;
  playerName: string | undefined;
  color: Color | undefined;
  /** Epic Corporations: Achievement Unlocked's claim of a milestone someone else claimed first. */
  sharedWith?: Array<{name: string, color: Color}>;
  scores: Array<MilestoneScore>;
}
