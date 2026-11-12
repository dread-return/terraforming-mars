import {IAward} from '../IAward';
import {IPlayer} from '../../IPlayer';
import {Tag} from '../../../common/cards/Tag';

/** GIGA fan award. */
export class Ionizer implements IAward {
  public readonly name = 'Ionizer';
  public readonly description = 'Have the most Radioactive tags in play';
  public getScore(player: IPlayer): number {
    return player.tags.count(Tag.RADIOACTIVE, 'award');
  }
}
