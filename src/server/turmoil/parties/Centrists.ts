import {IParty} from './IParty';
import {Party} from './Party';
import {PartyName} from '../../../common/turmoil/PartyName';
import {Resource} from '../../../common/Resource';
import {Bonus} from '../Bonus';
import {IPlayer} from '../../IPlayer';
import {PendingPolicy} from '../GigaTurmoil';

export class Centrists extends Party implements IParty {
  readonly name = PartyName.CENTRISTS;
  // Not decoded yet: cp01 (a Corporation "X" and a Prelude "X") and cp02 (delegate : -3 M€). cp01 is a placeholder so the party has a policy.
  readonly bonuses = [CENTRISTS_BONUS_1, CENTRISTS_BONUS_2];
  readonly policies = [CENTRISTS_POLICY_1];
}

class CentristsBonus01 extends Bonus {
  readonly id = 'cb01' as const;
  readonly description = 'Gain 3 M€';

  getScore() {
    return 3;
  }

  grantForPlayer(player: IPlayer): void {
    player.stock.add(Resource.MEGACREDITS, 3, {log: true, from: {partyName: PartyName.CENTRISTS}});
  }
}

class CentristsBonus02 extends Bonus {
  readonly id = 'cb02' as const;
  readonly description = 'Gain 1 M€ for each different type of tag you have';

  getScore(player: IPlayer) {
    return player.tags.distinctCount('default');
  }

  grantForPlayer(player: IPlayer): void {
    player.stock.add(Resource.MEGACREDITS, this.getScore(player), {log: true, from: {partyName: PartyName.CENTRISTS}});
  }
}

export const CENTRISTS_BONUS_1 = new CentristsBonus01();
export const CENTRISTS_BONUS_2 = new CentristsBonus02();
export const CENTRISTS_POLICY_1 = new PendingPolicy('cp01');
