import {BaseMilestone} from '../IMilestone';
import {IPlayer} from '../../IPlayer';
import {Tag} from '../../../common/cards/Tag';

/** Mercury vs Mars milestone: a Mercury, a Venus, an Earth, a Mars and a Jovian tag. Only with Pathfinders. */
export class Solarist extends BaseMilestone {
  constructor() {
    super(
      'Solarist',
      'Have at least 1 Mercury, Venus, Earth, Mars and Jovian tag',
      1);
  }

  public getScore(player: IPlayer): number {
    return Math.min(...[Tag.MERCURY, Tag.VENUS, Tag.EARTH, Tag.MARS, Tag.JOVIAN].map((tag) => player.tags.count(tag, 'milestone')));
  }
}
