import {IParty} from '../parties/IParty';
import {Party} from '../parties/Party';
import {PartyName} from '../../../common/turmoil/PartyName';
import {Resource} from '../../../common/Resource';
import {Tag} from '../../../common/cards/Tag';
import {IPolicy} from '../Policy';
import {IPlayer} from '../../IPlayer';
import {buyFirstCardPolicy, cardsWithoutTags, MegacreditBonus, tagChoice} from './GigaHelpers';

const from = {partyName: PartyName.EMPOWER};

const BONUS_A = new MegacreditBonus('Eb01', PartyName.EMPOWER,
  'Gain 1 M€ for every energy tag, nuclear tag and card with no tag you have',
  (player) => player.tags.count(Tag.POWER, 'raw') + player.tags.count(Tag.RADIOACTIVE, 'raw') + cardsWithoutTags(player));

// TODO(Leo): the "2 M€ for every industry" half of this bonus needs industry tiles, which do not exist yet.
const BONUS_B = new MegacreditBonus('Eb02', PartyName.EMPOWER,
  'Gain 1 M€ for every energy production you have (and 2 M€ for every industry, which is not in the game yet)',
  (player) => player.production.energy);

// TODO(Leo): the second half of this policy ("2 M€ can be used as energy resources") is not implemented. Energy can be
// spent as 2 M€ each, but M€ cannot be spent to pay energy costs yet.
const POLICY_1: IPolicy = {
  id: 'Ep01',
  description: 'Energy resources can be used as 2 M€ each',
  energyValue: 2,
};

const POLICY_2: IPolicy = {
  id: 'Ep02',
  description: 'Gain 2 energy every time you raise or lower your energy production',
  onProductionChanged(player: IPlayer, resource: Resource) {
    if (resource === Resource.ENERGY) {
      player.stock.add(Resource.ENERGY, 2, {log: true, from});
    }
  },
};

const POLICY_3: IPolicy = {
  id: 'Ep03',
  description: 'You are considered to have 2 more energy tags',
  tagBonus: (_player: IPlayer, tag: Tag) => tag === Tag.POWER ? 2 : 0,
};

const POLICY_4 = buyFirstCardPolicy('Ep04', PartyName.EMPOWER,
  'Action: choose the energy tag or the nuclear tag, and spend 4 M€ to buy the first card with that tag',
  [tagChoice(Tag.POWER), tagChoice(Tag.RADIOACTIVE)]);

export class GigaEmpower extends Party implements IParty {
  readonly name = PartyName.EMPOWER;
  readonly bonuses = [BONUS_A, BONUS_B];
  readonly policies = [POLICY_1, POLICY_2, POLICY_3, POLICY_4];
}
