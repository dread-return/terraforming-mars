import {IParty} from './IParty';
import {Party} from './Party';
import {PartyName} from '../../../common/turmoil/PartyName';
import {Resource} from '../../../common/Resource';
import {Bonus} from '../Bonus';
import {IPlayer} from '../../IPlayer';
import {PendingBonus, PendingPolicy} from '../GigaTurmoil';

export class Populists extends Party implements IParty {
  readonly name = PartyName.POPULISTS;
  // Not decoded yet: pb02 (2 M€ per a crowd in a white square), pp01 (a TR icon followed by "!"), pp02 ("±X Mars : ±X M€").
  // pp01 is a placeholder so the party has a policy.
  readonly bonuses = [POPULISTS_BONUS_1, POPULISTS_BONUS_2];
  readonly policies = [POPULISTS_POLICY_1];
}

class PopulistsBonus01 extends Bonus {
  readonly id = 'pb01' as const;
  readonly description = 'Lose 1 M€ for every 10 M€ you have';

  getScore(player: IPlayer) {
    return -Math.floor(player.megaCredits / 10);
  }

  grantForPlayer(player: IPlayer): void {
    player.stock.deduct(Resource.MEGACREDITS, -this.getScore(player), {log: true, from: {partyName: PartyName.POPULISTS}});
  }
}

export const POPULISTS_BONUS_1 = new PopulistsBonus01();
export const POPULISTS_BONUS_2 = new PendingBonus('pb02');
export const POPULISTS_POLICY_1 = new PendingPolicy('pp01');
