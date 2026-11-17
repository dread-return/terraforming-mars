import {IAward} from '../IAward';
import {IPlayer} from '../../IPlayer';
import {Tag} from '../../../common/cards/Tag';

/** Mercury vs Mars award. */
export class Daedalus implements IAward {
  public readonly name = 'Daedalus';
  public readonly description = 'Have the most Mercury tags in play';
  public getScore(player: IPlayer): number {
    return player.tags.count(Tag.MERCURY, 'award');
  }
}
