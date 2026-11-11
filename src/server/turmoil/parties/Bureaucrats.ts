import {IParty} from './IParty';
import {Party} from './Party';
import {PartyName} from '../../../common/turmoil/PartyName';
import {Resource} from '../../../common/Resource';
import {Bonus} from '../Bonus';
import {IPolicy} from '../Policy';
import {IPlayer} from '../../IPlayer';
import {countDelegatesInParties, PendingBonus} from '../GigaTurmoil';

export class Bureaucrats extends Party implements IParty {
  readonly name = PartyName.BUREAUCRATS;
  // bb01 (1 M€ per a yellow circle with a down arrow) and bp02 ("max 2 ACTION") are not decoded yet.
  readonly bonuses = [BUREAUCRATS_BONUS_1, BUREAUCRATS_BONUS_2];
  readonly policies = [BUREAUCRATS_POLICY_1];
}

class BureaucratsBonus02 extends Bonus {
  readonly id = 'bb02' as const;
  readonly description = 'Gain 2 M€ for each delegate you have in the parties';

  getScore(player: IPlayer) {
    return 2 * countDelegatesInParties(player);
  }

  grantForPlayer(player: IPlayer): void {
    player.stock.add(Resource.MEGACREDITS, this.getScore(player), {log: true, from: {partyName: PartyName.BUREAUCRATS}});
  }
}

class BureaucratsPolicy01 implements IPolicy {
  readonly id = 'bp01' as const;
  readonly description = 'When you pass, add a delegate to any party for free';
  // The delegate itself is sent by PartyHooks.applyBureaucratsRulingPolicy, which avoids an import cycle with Turmoil.
}

// Placeholder until the first Bureaucrats bonus is decoded. Listed first because it is the default bonus on the card.
export const BUREAUCRATS_BONUS_1 = new PendingBonus('bb01');
export const BUREAUCRATS_BONUS_2 = new BureaucratsBonus02();
export const BUREAUCRATS_POLICY_1 = new BureaucratsPolicy01();
