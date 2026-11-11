import {IParty} from '../parties/IParty';
import {Party} from '../parties/Party';
import {PartyName} from '../../../common/turmoil/PartyName';
import {Resource} from '../../../common/Resource';
import {IPolicy} from '../Policy';
import {IPlayer} from '../../IPlayer';
import {ICard} from '../../cards/ICard';
import {DiscardCards} from '../../deferredActions/DiscardCards';
import {countDelegatesInParties, MegacreditBonus} from './GigaHelpers';

const from = {partyName: PartyName.BUREAUCRATS};

function influence(player: IPlayer): number {
  return player.game.turmoil?.getInfluence(player) ?? 0;
}

const BONUS_A = new MegacreditBonus('Bb01', PartyName.BUREAUCRATS,
  'Gain 2 M€ for every delegate you have in a party',
  (player) => 2 * countDelegatesInParties(player));

// The card reads "2 M€ for every chairman bonus and every influence". Being chairman already counts as an influence, so
// this gives 2 M€ per influence you have.
const BONUS_B = new MegacreditBonus('Bb02', PartyName.BUREAUCRATS,
  'Gain 2 M€ for every influence you have (the chairman seat counts as one)',
  (player) => 2 * influence(player));

const POLICY_1: IPolicy = {
  id: 'Bp01',
  description: 'This generation you can take at most 2 actions on cards in play, plus your influence',
  cardActionLimit: (player: IPlayer) => 2 + influence(player),
};

const POLICY_2: IPolicy = {
  id: 'Bp02',
  description: 'At the start of each of your turns, pay 3 M€ minus your influence',
  onTurnStart(player: IPlayer) {
    const amount = Math.min(Math.max(0, 3 - influence(player)), player.megaCredits);
    if (amount > 0) {
      player.stock.deduct(Resource.MEGACREDITS, amount, {log: true, from});
    }
  },
};

const POLICY_3: IPolicy = {
  id: 'Bp03',
  description: 'Gain 3 M€ every time you place a delegate',
  onDelegatePlaced(player: IPlayer) {
    player.stock.add(Resource.MEGACREDITS, 3, {log: true, from});
  },
};

const POLICY_4: IPolicy = {
  id: 'Bp04',
  description: 'Discard a card every time you play a card. Does not apply to the chairman',
  onCardPlayed(player: IPlayer, _card: ICard) {
    if (player.game.turmoil?.chairman === player) {
      return;
    }
    if (player.cardsInHand.length > 0) {
      player.game.defer(new DiscardCards(player, 1, 1));
    }
  },
};

export class GigaBureaucrats extends Party implements IParty {
  readonly name = PartyName.BUREAUCRATS;
  readonly bonuses = [BONUS_A, BONUS_B];
  readonly policies = [POLICY_1, POLICY_2, POLICY_3, POLICY_4];
}
