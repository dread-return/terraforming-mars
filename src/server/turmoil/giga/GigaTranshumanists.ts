import {IParty} from '../parties/IParty';
import {Party} from '../parties/Party';
import {PartyName} from '../../../common/turmoil/PartyName';
import {Resource} from '../../../common/Resource';
import {Tag} from '../../../common/cards/Tag';
import {IPolicy} from '../Policy';
import {IPlayer} from '../../IPlayer';
import {cardsWithTagRequirement, MegacreditBonus} from './GigaHelpers';

const from = {partyName: PartyName.TRANSHUMANISTS};

const BONUS_A = new MegacreditBonus('Tb01', PartyName.TRANSHUMANISTS,
  'Gain 1 M€ for every wild tag and every card with a tag requirement you have',
  (player) => player.tags.count(Tag.WILD, 'raw') + cardsWithTagRequirement(player));

// TODO(Leo): the postlude half of this bonus ("2 M€ for every postlude you played") needs postludes, which do not exist yet.
const BONUS_B = new MegacreditBonus('Tb02', PartyName.TRANSHUMANISTS,
  'Gain 2 M€ for every milestone you claimed and award you funded (postludes are not in the game yet)',
  (player) => {
    const game = player.game;
    return 2 * (game.claimedMilestones.filter((m) => m.player === player).length +
      game.fundedAwards.filter((a) => a.player === player).length);
  });

const POLICY_1: IPolicy = {
  id: 'Tp01',
  description: 'You are considered to have 1 more wild tag',
  tagBonus: (_player: IPlayer, tag: Tag) => tag === Tag.WILD ? 1 : 0,
};

const POLICY_2: IPolicy = {
  id: 'Tp02',
  description: 'Gain 2 M€ every time you play a standard project',
  onStandardProject(player: IPlayer) {
    player.stock.add(Resource.MEGACREDITS, 2, {log: true, from});
  },
};

// TODO(Leo): policy 3 ("Action: 5 M€ to buy a postlude") needs postludes. Policy 4 ("Action: spend 10 M€ and draw 2
// milestones or awards, replace an unclaimed one with one of those, and you may immediately claim that tile") is not
// built yet. Transhumanists have policies 1 and 2 until then.

export class GigaTranshumanists extends Party implements IParty {
  readonly name = PartyName.TRANSHUMANISTS;
  readonly bonuses = [BONUS_A, BONUS_B];
  readonly policies = [POLICY_1, POLICY_2];
}
