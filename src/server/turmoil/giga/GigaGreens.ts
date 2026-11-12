import {IParty} from '../parties/IParty';
import {Party} from '../parties/Party';
import {PartyName} from '../../../common/turmoil/PartyName';
import {Tag} from '../../../common/cards/Tag';
import {Resource} from '../../../common/Resource';
import {CardResource} from '../../../common/CardResource';
import {IPolicy} from '../Policy';
import {IPlayer} from '../../IPlayer';
import {ICard} from '../../cards/ICard';
import {Space} from '../../boards/Space';
import {Board} from '../../boards/Board';
import {buyFirstCardPolicy, isOnMars, MegacreditBonus, tagChoice} from './GigaHelpers';
import {DomesWilderness} from '../../domesWilderness/DomesWilderness';

const from = {partyName: PartyName.GREENS};

const BONUS_A = new MegacreditBonus('Gb01', PartyName.GREENS,
  'Gain 1 M€ for every plant, microbe and animal tag you have',
  (player) => player.tags.count(Tag.PLANT, 'raw') + player.tags.count(Tag.MICROBE, 'raw') + player.tags.count(Tag.ANIMAL, 'raw'));

const BONUS_B = new MegacreditBonus('Gb02', PartyName.GREENS,
  'Gain 2 M€ for every greenery you have',
  (player) => 2 * DomesWilderness.countGreeneries(player.game.board.spaces.filter((space) => Board.isGreenerySpace(space) && Board.spaceOwnedBy(space, player))));

const POLICY_1: IPolicy = {
  id: 'Gp01',
  description: 'Gain 4 M€ every time you place a greenery',
  onTilePlaced(player: IPlayer, space: Space) {
    if (Board.isGreenerySpace(space)) {
      player.stock.add(Resource.MEGACREDITS, 4, {log: true, from});
    }
  },
};

const POLICY_2: IPolicy = {
  id: 'Gp02',
  description: 'Gain 1 plant every time you place a tile ON MARS',
  onTilePlaced(player: IPlayer, space: Space) {
    if (isOnMars(player.game, space)) {
      player.stock.add(Resource.PLANTS, 1, {log: true, from});
    }
  },
};

const POLICY_3: IPolicy = {
  id: 'Gp03',
  description: 'Every time you play a card with a plant, microbe or animal tag, gain 1 plant or place the matching resource on that card',
  onCardPlayed(player: IPlayer, card: ICard) {
    const matching: Partial<Record<Tag, CardResource>> = {[Tag.MICROBE]: CardResource.MICROBE, [Tag.ANIMAL]: CardResource.ANIMAL};
    for (const tag of card.tags) {
      if (tag !== Tag.PLANT && tag !== Tag.MICROBE && tag !== Tag.ANIMAL) {
        continue;
      }
      player.defer(() => {
        const resource = matching[tag];
        if (resource !== undefined && card.resourceType === resource) {
          player.addResourceTo(card, {qty: 1, log: true, from});
        } else {
          player.stock.add(Resource.PLANTS, 1, {log: true, from});
        }
      });
    }
  },
};

const POLICY_4 = buyFirstCardPolicy('Gp04', PartyName.GREENS,
  'Action: choose the plant tag or the animal tag, and spend 4 M€ to buy the first card with that tag',
  [tagChoice(Tag.PLANT), tagChoice(Tag.ANIMAL)]);

export class GigaGreens extends Party implements IParty {
  readonly name = PartyName.GREENS;
  readonly bonuses = [BONUS_A, BONUS_B];
  readonly policies = [POLICY_1, POLICY_2, POLICY_3, POLICY_4];
}
