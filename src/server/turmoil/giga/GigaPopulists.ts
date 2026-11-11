import {IParty} from '../parties/IParty';
import {Party} from '../parties/Party';
import {PartyName} from '../../../common/turmoil/PartyName';
import {Resource} from '../../../common/Resource';
import {CardType} from '../../../common/cards/CardType';
import {IPolicy} from '../Policy';
import {IPlayer} from '../../IPlayer';
import {ICard} from '../../cards/ICard';
import {buyFirstCardPolicy, MegacreditBonus} from './GigaHelpers';

const from = {partyName: PartyName.POPULISTS};

const BONUS_A = new MegacreditBonus('Pb01', PartyName.POPULISTS,
  'Gain 1 M€ for every event you have played',
  (player) => player.getPlayedEventsCount());

// TODO(Leo): Populists bonus B ("2 M€ for every population and face-up faction card") and policy 2 ("pay 4 M€, gain one
// population from any sector") need the Populations and Factions expansion, which is not in the game yet. For now
// Populists have one bonus and three policies (1, 3 and 4).

const POLICY_1: IPolicy = {
  id: 'Pp01',
  description: 'Every time you play a card with VP (positive or negative), gain or pay twice that many M€',
  onCardPlayed(player: IPlayer, card: ICard) {
    // Only fixed VP count. Cards that score by a formula are not covered.
    const vp = typeof card.victoryPoints === 'number' ? card.victoryPoints : 0;
    if (vp > 0) {
      player.stock.add(Resource.MEGACREDITS, 2 * vp, {log: true, from});
    } else if (vp < 0) {
      player.stock.deduct(Resource.MEGACREDITS, Math.min(-2 * vp, player.megaCredits), {log: true, from});
    }
  },
};

const POLICY_3: IPolicy = {
  id: 'Pp03',
  description: 'Draw a card every time you play an event card',
  onCardPlayed(player: IPlayer, card: ICard) {
    if (card.type === CardType.EVENT) {
      player.drawCard();
    }
  },
};

const POLICY_4 = buyFirstCardPolicy('Pp04', PartyName.POPULISTS,
  'Action: spend 4 M€ to buy the first card with the event tag',
  [{title: 'Buy the first event card', include: (card) => card.type === CardType.EVENT}]);

export class GigaPopulists extends Party implements IParty {
  readonly name = PartyName.POPULISTS;
  readonly bonuses = [BONUS_A];
  readonly policies = [POLICY_1, POLICY_3, POLICY_4];
}
