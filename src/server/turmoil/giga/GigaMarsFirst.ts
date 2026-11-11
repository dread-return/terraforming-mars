import {IParty} from '../parties/IParty';
import {Party} from '../parties/Party';
import {PartyName} from '../../../common/turmoil/PartyName';
import {Tag} from '../../../common/cards/Tag';
import {Resource} from '../../../common/Resource';
import {IPolicy} from '../Policy';
import {IPlayer} from '../../IPlayer';
import {Space} from '../../boards/Space';
import {ICard} from '../../cards/ICard';
import {SelectPaymentDeferred} from '../../deferredActions/SelectPaymentDeferred';
import {PlaceCityTile} from '../../deferredActions/PlaceCityTile';
import {TITLES} from '../../inputs/titles';
import {buyFirstCardPolicy, isOnMars, logPartyAction, MegacreditBonus, tagChoice, tilesOnMars} from './GigaHelpers';

const from = {partyName: PartyName.MARS};

const BONUS_A = new MegacreditBonus('Mb01', PartyName.MARS,
  'Gain 1 M€ for every building and Mars tag you have',
  (player) => player.tags.count(Tag.BUILDING, 'raw') + player.tags.count(Tag.MARS, 'raw'));

const BONUS_B = new MegacreditBonus('Mb02', PartyName.MARS,
  'Gain 1 M€ for every tile you have ON MARS',
  tilesOnMars);

const POLICY_1: IPolicy = {
  id: 'Mp01',
  description: 'Gain 1 steel every time you place a tile ON MARS',
  onTilePlaced(player: IPlayer, space: Space) {
    if (isOnMars(player.game, space)) {
      player.stock.add(Resource.STEEL, 1, {log: true, from});
    }
  },
};

const POLICY_2: IPolicy = {
  id: 'Mp02',
  description: 'Action: pay 22 M€ (steel can be used) to place a city tile ON MARS. Repeatable',
  canAct(player: IPlayer) {
    return player.canAfford({cost: 22, steel: true}) && player.game.board.getAvailableSpacesForCity(player).length > 0;
  },
  action(player: IPlayer) {
    logPartyAction(player, PartyName.MARS);
    const game = player.game;
    game.defer(new SelectPaymentDeferred(player, 22, {canUseSteel: true, title: TITLES.payForPartyAction(PartyName.MARS)}))
      .andThen(() => game.defer(new PlaceCityTile(player)));
    return undefined;
  },
};

const POLICY_3: IPolicy = {
  id: 'Mp03',
  description: 'Gain 2 M€ every time you play a card with a building tag or a Mars tag',
  onCardPlayed(player: IPlayer, card: ICard) {
    if (card.tags.includes(Tag.BUILDING) || card.tags.includes(Tag.MARS)) {
      player.stock.add(Resource.MEGACREDITS, 2, {log: true, from});
    }
  },
};

const POLICY_4 = buyFirstCardPolicy('Mp04', PartyName.MARS,
  'Action: choose the building tag or the Mars tag, and spend 4 M€ to buy the first card with that tag',
  [tagChoice(Tag.BUILDING), tagChoice(Tag.MARS)]);

export class GigaMarsFirst extends Party implements IParty {
  readonly name = PartyName.MARS;
  readonly bonuses = [BONUS_A, BONUS_B];
  readonly policies = [POLICY_1, POLICY_2, POLICY_3, POLICY_4];
}

