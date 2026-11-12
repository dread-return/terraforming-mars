import {BaseMilestone} from './IMilestone';
import {IPlayer} from '../IPlayer';
import {DomesWilderness} from '../domesWilderness/DomesWilderness';

export class Gardener extends BaseMilestone {
  public readonly automaDescription = '3+ greenery tiles on board';
  constructor() {
    super(
      'Gardener',
      'Own 3 greenery tiles',
      3);
  }
  public getScore(player: IPlayer): number {
    return DomesWilderness.countGreeneries(player.game.board.getGreeneries(player));
  }
}
