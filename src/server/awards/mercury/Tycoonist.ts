import {IAward} from '../IAward';
import {IPlayer} from '../../IPlayer';
import {Mercury} from '../../mercury/Mercury';

/** Mercury vs Mars award. */
export class Tycoonist implements IAward {
  public readonly name = 'Tycoonist';
  public readonly description = 'Have the most resolved Act cards in your played cards';
  public getScore(player: IPlayer): number {
    return Mercury.playedActs(player);
  }
}
