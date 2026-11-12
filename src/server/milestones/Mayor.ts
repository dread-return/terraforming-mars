import {BaseMilestone} from './IMilestone';
import {IPlayer} from '../IPlayer';
import {DomesWilderness} from '../domesWilderness/DomesWilderness';

export class Mayor extends BaseMilestone {
  public readonly automaDescription = '3+ city tiles on board';
  constructor() {
    super(
      'Mayor',
      'Own 3 city tiles',
      3);
  }
  public getScore(player: IPlayer): number {
    return DomesWilderness.countCities(player.game.board.getCities(player));
  }
}
