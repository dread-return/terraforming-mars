import {BaseMilestone} from '../IMilestone';
import {IPlayer} from '../../IPlayer';

/** Mercury vs Mars milestone. */
export class Starman extends BaseMilestone {
  constructor() {
    super(
      'Starman',
      'Have 3 colonies',
      3);
  }

  public getScore(player: IPlayer): number {
    return player.getColoniesCount();
  }
}
