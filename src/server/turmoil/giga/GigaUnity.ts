import {IParty} from '../parties/IParty';
import {Party} from '../parties/Party';
import {PartyName} from '../../../common/turmoil/PartyName';
import {Tag} from '../../../common/cards/Tag';
import {IPolicy} from '../Policy';
import {IPlayer} from '../../IPlayer';
import {SelectPaymentDeferred} from '../../deferredActions/SelectPaymentDeferred';
import {TITLES} from '../../inputs/titles';
import {buyFirstCardPolicy, canUsePartyAction, logPartyAction, MegacreditBonus, tagChoice} from './GigaHelpers';

const BONUS_A = new MegacreditBonus('Ub01', PartyName.UNITY,
  'Gain 1 M€ for every planet tag you have, except Mars',
  (player) => player.tags.count(Tag.VENUS, 'raw') + player.tags.count(Tag.EARTH, 'raw') + player.tags.count(Tag.JOVIAN, 'raw'));

// Held: the infrastructure tag does not exist yet, so for now this counts space tags and titanium production.
const BONUS_B = new MegacreditBonus('Ub02', PartyName.UNITY,
  'Gain 1 M€ for every space tag and titanium production you have (infrastructure tags are not in the game yet)',
  (player) => player.tags.count(Tag.SPACE, 'raw') + player.production.titanium);

const POLICY_1: IPolicy = {
  id: 'Up01',
  description: 'Titanium resources are worth 1 more M€',
  titaniumValueBonus: 1,
};

const POLICY_2: IPolicy = {
  id: 'Up02',
  description: 'Action: spend 10 M€ to gain a trade fleet (Colonies)',
  canAct(player: IPlayer) {
    return player.game.gameOptions.coloniesExtension && player.canAfford(10) && canUsePartyAction(player);
  },
  action(player: IPlayer) {
    logPartyAction(player, PartyName.UNITY);
    player.politicalAgendasActionUsedCount++;
    player.game.defer(new SelectPaymentDeferred(player, 10, {title: TITLES.payForPartyAction(PartyName.UNITY)}))
      .andThen(() => player.colonies.increaseFleetSize());
    return undefined;
  },
};

const POLICY_3: IPolicy = {
  id: 'Up03',
  description: 'All players are considered to have 2 more space tags',
  tagBonus: (_player: IPlayer, tag: Tag) => tag === Tag.SPACE ? 2 : 0,
};

const POLICY_4 = buyFirstCardPolicy('Up04', PartyName.UNITY,
  'Action: choose a planet tag (except Mars) or the space tag, and spend 4 M€ to buy the first card with that tag',
  (player) => [Tag.VENUS, Tag.EARTH, Tag.JOVIAN, Tag.MOON, Tag.MERCURY, Tag.SPACE]
    .filter((tag) => player.game.tags.includes(tag))
    .map(tagChoice));

export class GigaUnity extends Party implements IParty {
  readonly name = PartyName.UNITY;
  readonly bonuses = [BONUS_A, BONUS_B];
  readonly policies = [POLICY_1, POLICY_2, POLICY_3, POLICY_4];
}
