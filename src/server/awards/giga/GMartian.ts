import {IAward} from '../IAward';
import {IPlayer} from '../../IPlayer';
import {Tag} from '../../../common/cards/Tag';

/** GIGA fan award. Named 'G. Martian' so it does not clash with the Martian milestone. */
export class GMartian implements IAward {
  public readonly name = 'G. Martian';
  public readonly description = 'Have the most Mars tags in play';
  public getScore(player: IPlayer): number {
    return player.tags.count(Tag.MARS, 'award');
  }
}
