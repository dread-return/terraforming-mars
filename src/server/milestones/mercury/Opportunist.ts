import {BaseMilestone} from '../IMilestone';
import {IPlayer} from '../../IPlayer';
import {Mercury} from '../../mercury/Mercury';

/** Mercury vs Mars milestone: resolved Act cards in your played cards. */
export class Opportunist extends BaseMilestone {
  constructor() {
    super(
      'Opportunist',
      'Have 3 resolved Act cards in your played cards',
      3);
  }

  public getScore(player: IPlayer): number {
    return Mercury.playedActs(player);
  }
}
