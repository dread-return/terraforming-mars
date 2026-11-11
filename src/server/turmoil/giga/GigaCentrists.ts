import {IParty} from '../parties/IParty';
import {Party} from '../parties/Party';
import {PartyName} from '../../../common/turmoil/PartyName';
import {Resource} from '../../../common/Resource';
import {IPolicy} from '../Policy';
import {IPlayer} from '../../IPlayer';
import {ICard} from '../../cards/ICard';
import {OrOptions} from '../../inputs/OrOptions';
import {SelectOption} from '../../inputs/SelectOption';
import {SelectPaymentDeferred} from '../../deferredActions/SelectPaymentDeferred';
import {TITLES} from '../../inputs/titles';
import {Tag} from '../../../common/cards/Tag';
import {ALL_PRODUCTIONS, buyFirstCardPolicy, canUsePartyAction, kindsOfTiles, logPartyAction, MegacreditBonus, newTagsOn} from './GigaHelpers';

const from = {partyName: PartyName.CENTRISTS};

const BONUS_A = new MegacreditBonus('Cb01', PartyName.CENTRISTS,
  'Gain 1 M€ for every different tag you have',
  (player) => player.tags.distinctCount('default'));

const BONUS_B = new MegacreditBonus('Cb02', PartyName.CENTRISTS,
  'Gain 2 M€ for every kind of tile you have',
  (player) => 2 * kindsOfTiles(player));

const STANDARD_RESOURCES = [Resource.STEEL, Resource.TITANIUM, Resource.PLANTS, Resource.ENERGY, Resource.HEAT] as const;

const POLICY_1: IPolicy = {
  id: 'Cp01',
  description: 'Action: pay 1 of each standard resource, except M€, to gain 15 M€',
  canAct(player: IPlayer) {
    return canUsePartyAction(player) && STANDARD_RESOURCES.every((resource) => player.stock.get(resource) >= 1);
  },
  action(player: IPlayer) {
    logPartyAction(player, PartyName.CENTRISTS);
    player.politicalAgendasActionUsedCount++;
    for (const resource of STANDARD_RESOURCES) {
      player.stock.deduct(resource, 1, {log: true, from});
    }
    player.stock.add(Resource.MEGACREDITS, 15, {log: true, from});
    return undefined;
  },
};

const POLICY_2: IPolicy = {
  id: 'Cp02',
  description: 'Action: pay 7 M€ to raise one of your lowest productions 1 step',
  canAct(player: IPlayer) {
    return canUsePartyAction(player) && player.canAfford(7);
  },
  action(player: IPlayer) {
    logPartyAction(player, PartyName.CENTRISTS);
    player.politicalAgendasActionUsedCount++;
    player.game.defer(new SelectPaymentDeferred(player, 7, {title: TITLES.payForPartyAction(PartyName.CENTRISTS)}))
      .andThen(() => {
        const lowest = Math.min(...ALL_PRODUCTIONS.map((resource) => player.production[resource]));
        const options = ALL_PRODUCTIONS
          .filter((resource) => player.production[resource] === lowest)
          .map((resource) => new SelectOption(`Raise your ${resource} production 1 step`).andThen(() => {
            player.production.add(resource, 1, {log: true, from});
            return undefined;
          }));
        if (options.length === 1) {
          return options[0].cb(undefined);
        }
        player.defer(new OrOptions(...options).setTitle('Select one of your lowest productions to raise'));
        return undefined;
      });
    return undefined;
  },
};

const POLICY_3: IPolicy = {
  id: 'Cp03',
  description: 'Gain 4 M€ every time you play a card with a tag you did not have',
  onCardPlayed(player: IPlayer, card: ICard) {
    if (newTagsOn(player, card) > 0) {
      player.stock.add(Resource.MEGACREDITS, 4, {log: true, from});
    }
  },
};

const POLICY_4 = buyFirstCardPolicy('Cp04', PartyName.CENTRISTS,
  'Action: spend 4 M€ to buy the first card with a tag you do not have',
  (player) => [{
    title: 'Buy the first card with a tag you do not have',
    include: (card) => card.tags.some((tag) => tag !== Tag.EVENT && tag !== Tag.WILD && tag !== Tag.CLONE && player.tags.count(tag, 'raw') === 0),
  }]);

export class GigaCentrists extends Party implements IParty {
  readonly name = PartyName.CENTRISTS;
  readonly bonuses = [BONUS_A, BONUS_B];
  readonly policies = [POLICY_1, POLICY_2, POLICY_3, POLICY_4];
}
