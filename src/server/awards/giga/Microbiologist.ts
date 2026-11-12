import {IAward} from '../IAward';
import {IPlayer} from '../../IPlayer';
import {Tag} from '../../../common/cards/Tag';

/** GIGA fan award. */
export class Microbiologist implements IAward {
  public readonly name = 'Microbiologist';
  public readonly description = 'Have the most microbe tags in play';
  public getScore(player: IPlayer): number {
    return player.tags.count(Tag.MICROBE, 'award');
  }
}
