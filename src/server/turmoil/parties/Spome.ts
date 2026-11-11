import {IParty} from './IParty';
import {Party} from './Party';
import {PartyName} from '../../../common/turmoil/PartyName';
import {Resource} from '../../../common/Resource';
import {Bonus} from '../Bonus';
import {IPolicy} from '../Policy';
import {IPlayer} from '../../IPlayer';
import {ICard} from '../../cards/ICard';
import {CardResource} from '../../../common/CardResource';
import {countOffWorldCities} from '../GigaTurmoil';

export class Spome extends Party implements IParty {
  readonly name = PartyName.SPOME;
  // Held until High Orbit is built: ob02 (1 M€ per High Orbit structure and Infrastructure tag), op02 (Infrastructure and
  // off-world city actions) and the High Orbit half of op01 (3 M€ per High Orbit structure placed).
  readonly bonuses = [SPOME_BONUS_1];
  readonly policies = [SPOME_POLICY_1];
}

class SpomeBonus01 extends Bonus {
  readonly id = 'ob01' as const;
  readonly description = 'Gain 1 M€ for each off-world city you have (space cities, Venus Habitats, Moon Habitats)';

  getScore(player: IPlayer) {
    return countOffWorldCities(player);
  }

  grantForPlayer(player: IPlayer): void {
    player.stock.add(Resource.MEGACREDITS, this.getScore(player), {log: true, from: {partyName: PartyName.SPOME}});
  }
}

class SpomePolicy01 implements IPolicy {
  readonly id = 'op01' as const;
  readonly description = 'When you add a floater to a card, gain 1 M€ per floater';

  onResourceAdded(player: IPlayer, card: ICard, count: number) {
    if (card.resourceType === CardResource.FLOATER) {
      player.stock.add(Resource.MEGACREDITS, count, {log: true, from: {partyName: PartyName.SPOME}});
    }
  }
}

export const SPOME_BONUS_1 = new SpomeBonus01();
export const SPOME_POLICY_1 = new SpomePolicy01();
