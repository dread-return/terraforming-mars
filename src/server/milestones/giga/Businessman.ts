import {BaseMilestone} from '../IMilestone';
import {IPlayer} from '../../IPlayer';
import {Tag} from '../../../common/cards/Tag';

/** GIGA fan milestone. */
export class Businessman extends BaseMilestone {
  constructor() {
    super(
      'Businessman',
      'Have 6 Earth and Mars tags in play (combined)',
      6);
  }

  public getScore(player: IPlayer): number {
    return player.tags.multipleCount([Tag.EARTH, Tag.MARS], 'milestone');
  }
}
