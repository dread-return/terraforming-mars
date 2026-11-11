import {IParty} from '../parties/IParty';
import {Party} from '../parties/Party';
import {PartyName} from '../../../common/turmoil/PartyName';
import {Tag} from '../../../common/cards/Tag';
import {GlobalParameter} from '../../../common/GlobalParameter';
import {IPolicy} from '../Policy';
import {IPlayer} from '../../IPlayer';
import {DiscardCards} from '../../deferredActions/DiscardCards';
import {buyFirstCardPolicy, MegacreditBonus, tagChoice} from './GigaHelpers';

const BONUS_A = new MegacreditBonus('Sb01', PartyName.SCIENTISTS,
  'Gain 1 M€ for every science tag you have',
  (player) => player.tags.count(Tag.SCIENCE, 'raw-pf'));

const BONUS_B = new MegacreditBonus('Sb02', PartyName.SCIENTISTS,
  'Gain 1 M€ for every card in your hand',
  (player) => player.cardsInHand.length);

const POLICY_1: IPolicy = {
  id: 'Sp01',
  description: 'All players are considered to have 2 more science tags',
  tagBonus: (_player: IPlayer, tag: Tag) => tag === Tag.SCIENCE ? 2 : 0,
};

const POLICY_2: IPolicy = {
  id: 'Sp02',
  description: 'Mars global parameter requirements are adjustable by +/- 2',
  requirementBonus: 2,
};

const POLICY_3: IPolicy = {
  id: 'Sp03',
  description: 'Draw a card and discard a card every time you raise a Mars global parameter',
  onMarsParameterRaised(player: IPlayer, _parameter: GlobalParameter, steps: number) {
    player.drawCard(steps);
    player.game.defer(new DiscardCards(player, steps, steps));
  },
};

const POLICY_4 = buyFirstCardPolicy('Sp04', PartyName.SCIENTISTS,
  'Action: choose the science tag or a requirement, and spend 4 M€ to buy the first card with that tag or requirement',
  [tagChoice(Tag.SCIENCE), {title: 'Buy the first card with a requirement', include: (card) => card.requirements.length > 0}]);

export class GigaScientists extends Party implements IParty {
  readonly name = PartyName.SCIENTISTS;
  readonly bonuses = [BONUS_A, BONUS_B];
  readonly policies = [POLICY_1, POLICY_2, POLICY_3, POLICY_4];
}
