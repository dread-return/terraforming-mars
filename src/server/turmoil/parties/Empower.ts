import {IParty} from './IParty';
import {Party} from './Party';
import {PartyName} from '../../../common/turmoil/PartyName';
import {Tag} from '../../../common/cards/Tag';
import {Resource} from '../../../common/Resource';
import {Bonus} from '../Bonus';
import {IPlayer} from '../../IPlayer';
import {PendingPolicy} from '../GigaTurmoil';

export class Empower extends Party implements IParty {
  readonly name = PartyName.EMPOWER;
  // Both policies are placeholders until Leo confirms their reading:
  // ep01 (energy counts as 2 M€) and ep02 (energy gained when energy production changes).
  readonly bonuses = [EMPOWER_BONUS_1, EMPOWER_BONUS_2];
  readonly policies = [EMPOWER_POLICY_1];
}

class EmpowerBonus01 extends Bonus {
  readonly id = 'eb01' as const;
  readonly description = 'Gain 1 M€ for each power, radioactive and wild tag you have';

  getScore(player: IPlayer) {
    return player.tags.count(Tag.POWER, 'raw') + player.tags.count(Tag.RADIOACTIVE, 'raw') + player.tags.count(Tag.WILD, 'raw');
  }

  grantForPlayer(player: IPlayer): void {
    player.stock.add(Resource.MEGACREDITS, this.getScore(player), {log: true, from: {partyName: PartyName.EMPOWER}});
  }
}

class EmpowerBonus02 extends Bonus {
  readonly id = 'eb02' as const;
  // Industry tiles come with the GIGA Industries add-on, which is not built yet, so only energy production counts for now.
  readonly description = 'Gain 1 M€ for each energy production you have (and each industry tile, once Industries exist)';

  getScore(player: IPlayer) {
    return player.production.energy;
  }

  grantForPlayer(player: IPlayer): void {
    player.stock.add(Resource.MEGACREDITS, this.getScore(player), {log: true, from: {partyName: PartyName.EMPOWER}});
  }
}

export const EMPOWER_BONUS_1 = new EmpowerBonus01();
export const EMPOWER_BONUS_2 = new EmpowerBonus02();
export const EMPOWER_POLICY_1 = new PendingPolicy('ep01');
