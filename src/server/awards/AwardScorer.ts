import {PlayerId} from '../../common/Types';
import {IGame} from '../IGame';
import {IPlayer} from '../IPlayer';
import {IAward} from './IAward';
import {CardName} from '../../common/cards/CardName';
import {ASIMOV_AWARD_BONUS} from '../../common/constants';
import {EpicHooks} from '../cards/epic/EpicHooks';

export class AwardScorer {
  private scores: Map<PlayerId, number> = new Map();
  constructor(game: IGame, award: IAward) {
    for (const player of game.players) {
      // Epic Corporations: Cold Fusion's energy production doesn't count.
      let score = EpicHooks.withoutColdFusionEnergy(player, () => award.getScore(player));
      if (player.tableau.has(CardName.ASIMOV)) {
        score += ASIMOV_AWARD_BONUS;
      }
      this.scores.set(player.id, score);
    }
  }

  public get(player: IPlayer): number {
    // Ideally throw when player does not match, but this is OK.
    return this.scores.get(player.id) ?? 0;
  }
}
