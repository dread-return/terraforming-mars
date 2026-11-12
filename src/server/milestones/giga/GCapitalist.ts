import {BaseMilestone} from '../IMilestone';
import {IPlayer} from '../../IPlayer';
import {Industries} from '../../industries/Industries';

/**
 * GIGA fan milestone. Not the same as Capitalist (Vastitas Borealis), which counts M€.
 */
export class GCapitalist extends BaseMilestone {
  constructor() {
    super(
      'G. Capitalist',
      'Own 3 industry tiles',
      3);
  }

  public getScore(player: IPlayer): number {
    return Industries.owned(player);
  }
}
