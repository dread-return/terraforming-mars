import {IAward} from '../IAward';
import {IPlayer} from '../../IPlayer';

/** Mercury vs Mars award. */
export class Colonist implements IAward {
  public readonly name = 'Colonist';
  public readonly description = 'Have the most colonies';
  public getScore(player: IPlayer): number {
    return player.getColoniesCount();
  }
}
