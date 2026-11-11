import {IParty} from './IParty';
import {Party} from './Party';
import {PartyName} from '../../../common/turmoil/PartyName';
import {Resource} from '../../../common/Resource';
import {IPolicy} from '../Policy';
import {IPlayer} from '../../IPlayer';
import {PendingBonus, PendingPolicy} from '../GigaTurmoil';

export class Transhumanists extends Party implements IParty {
  readonly name = PartyName.TRANSHUMANISTS;
  // Not decoded yet: tb01 (1 M€ per a red/yellow "track bar"), tb02 (1 M€ per Postlude tile + corporation + prelude),
  // tp01 ("-1 ?" on the same bar). tb01 and tp01 are placeholders so the party has a default bonus and policy.
  readonly bonuses = [TRANSHUMANISTS_BONUS_1];
  readonly policies = [TRANSHUMANISTS_POLICY_1, TRANSHUMANISTS_POLICY_2];
}

class TranshumanistsPolicy02 implements IPolicy {
  readonly id = 'tp02' as const;
  readonly description = 'When you use a standard project, gain 2 M€';

  onStandardProject(player: IPlayer) {
    player.stock.add(Resource.MEGACREDITS, 2, {log: true, from: {partyName: PartyName.TRANSHUMANISTS}});
  }
}

export const TRANSHUMANISTS_BONUS_1 = new PendingBonus('tb01');
export const TRANSHUMANISTS_POLICY_1 = new PendingPolicy('tp01');
export const TRANSHUMANISTS_POLICY_2 = new TranshumanistsPolicy02();
