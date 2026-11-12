import {IAward} from '../IAward';
import {IPlayer} from '../../IPlayer';
import {Tag} from '../../../common/cards/Tag';

/** GIGA fan award. */
export class Forerunner implements IAward {
  public readonly name = 'Forerunner';
  public readonly description = 'Have the most Galactic tags in play';
  public getScore(player: IPlayer): number {
    return player.tags.count(Tag.GALACTIC, 'award');
  }
}
