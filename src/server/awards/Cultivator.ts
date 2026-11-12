import {IAward} from './IAward';
import {IPlayer} from '../IPlayer';
import {DomesWilderness} from '../domesWilderness/DomesWilderness';

export class Cultivator implements IAward {
  public readonly name = 'Cultivator';
  public readonly description = 'Own the most greenery tiles';
  public readonly automaDescription = 'Greenery owned (unchanged)';
  public getScore(player: IPlayer): number {
    return DomesWilderness.countGreeneries(player.game.board.getGreeneries(player));
  }
}
