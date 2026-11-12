import {BaseMilestone} from '../IMilestone';
import {IPlayer} from '../../IPlayer';
import {GlobalParameter} from '../../../common/GlobalParameter';

/** GIGA fan milestone. Counts the Venus steps this player has raised, like Thawer does for temperature. */
export class Inflater extends BaseMilestone {
  constructor() {
    super(
      'Inflater',
      'Have raised the Venus scale 4 steps',
      4);
  }

  public getScore(player: IPlayer): number {
    return player.globalParameterSteps[GlobalParameter.VENUS];
  }
}
