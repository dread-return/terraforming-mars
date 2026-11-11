import {IParty} from '../parties/IParty';
import {Party} from '../parties/Party';
import {PartyName} from '../../../common/turmoil/PartyName';
import {GlobalParameter} from '../../../common/GlobalParameter';
import {Resource} from '../../../common/Resource';
import {IPolicy} from '../Policy';
import {IPlayer} from '../../IPlayer';
import {Space} from '../../boards/Space';
import {SelectPaymentDeferred} from '../../deferredActions/SelectPaymentDeferred';
import {TITLES} from '../../inputs/titles';
import {canUsePartyAction, isOnMars, logPartyAction, MegacreditBonus} from './GigaHelpers';

const from = {partyName: PartyName.KELVINISTS};

const BONUS_A = new MegacreditBonus('Kb01', PartyName.KELVINISTS,
  'Gain 1 M€ for every heat production you have',
  (player) => player.production.heat);

// TODO(Leo): Kelvinists bonus B ("2 M€ for every step on your individual temperature track") needs the individual
// terraforming tracks, which do not exist yet. Until then Kelvinists only have bonus A.

const POLICY_1: IPolicy = {
  id: 'Kp01',
  description: 'Gain 3 M€ every time you raise the temperature',
  onMarsParameterRaised(player: IPlayer, parameter: GlobalParameter, steps: number) {
    if (parameter === GlobalParameter.TEMPERATURE) {
      player.stock.add(Resource.MEGACREDITS, 3 * steps, {log: true, from});
    }
  },
};

const POLICY_2: IPolicy = {
  id: 'Kp02',
  description: 'Action: lower your heat production 2 steps to gain 1 TR',
  canAct(player: IPlayer) {
    return player.production.heat >= 2 && canUsePartyAction(player) && player.canAfford({cost: 0, tr: {tr: 1}});
  },
  action(player: IPlayer) {
    logPartyAction(player, PartyName.KELVINISTS);
    player.politicalAgendasActionUsedCount++;
    player.production.add(Resource.HEAT, -2, {log: true, from});
    player.increaseTerraformRating();
    return undefined;
  },
};

const POLICY_3: IPolicy = {
  id: 'Kp03',
  description: 'Action: pay 9 M€ to raise your heat production 2 steps. Repeatable',
  canAct(player: IPlayer) {
    return player.canAfford(9);
  },
  action(player: IPlayer) {
    logPartyAction(player, PartyName.KELVINISTS);
    player.game.defer(new SelectPaymentDeferred(player, 9, {title: TITLES.payForPartyAction(PartyName.KELVINISTS)}))
      .andThen(() => player.production.add(Resource.HEAT, 2, {log: true, from}));
    return undefined;
  },
};

const POLICY_4: IPolicy = {
  id: 'Kp04',
  description: 'Gain 2 heat every time you place a tile ON MARS',
  onTilePlaced(player: IPlayer, space: Space) {
    if (isOnMars(player.game, space)) {
      player.stock.add(Resource.HEAT, 2, {log: true, from});
    }
  },
};

export class GigaKelvinists extends Party implements IParty {
  readonly name = PartyName.KELVINISTS;
  readonly bonuses = [BONUS_A];
  readonly policies = [POLICY_1, POLICY_2, POLICY_3, POLICY_4];
}
