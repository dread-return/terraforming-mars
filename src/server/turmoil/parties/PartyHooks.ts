import {IPlayer} from '../../IPlayer';
import {PartyName} from '../../../common/turmoil/PartyName';
import {SpaceType} from '../../../common/boards/SpaceType';
import {Phase} from '../../../common/Phase';
import {PolicyId} from '../../../common/turmoil/Types';
import {Resource} from '../../../common/Resource';
import {Space} from '../../boards/Space';
import {GREENS_POLICY_1} from './Greens';
import {SPOME_POLICY_1} from './Spome';
import {SendDelegateToArea} from '../../deferredActions/SendDelegateToArea';
import {TRANSHUMANISTS_POLICY_2} from './Transhumanists';
import {ICard} from '../../cards/ICard';
import {PoliticalAgendas} from '../PoliticalAgendas';
import {CardName} from '../../../common/cards/CardName';

export class PartyHooks {
  static applyMarsFirstRulingPolicy(player: IPlayer, spaceType: SpaceType) {
    if (this.shouldApplyPolicy(player, PartyName.MARS, 'mp01') &&
        spaceType !== SpaceType.COLONY) {
      player.stock.add(Resource.STEEL, 1);
    }
  }

  static applyGreensRulingPolicy(player: IPlayer, space: Space) {
    if (this.shouldApplyPolicy(player, PartyName.GREENS, 'gp01')) {
      const greensPolicy = GREENS_POLICY_1;
      greensPolicy.onTilePlaced(player, space);
    }
  }

  // Giga Turmoil ruling policies.
  static applySpomeRulingPolicy(player: IPlayer, card: ICard, count: number) {
    // Spome is only in play in Giga Turmoil games, so bail out early otherwise.
    if (player.game?.turmoil?.gigaTurmoil !== true) {
      return;
    }
    if (this.shouldApplyPolicy(player, PartyName.SPOME, 'op01')) {
      SPOME_POLICY_1.onResourceAdded(player, card, count);
    }
  }

  static applyBureaucratsRulingPolicy(player: IPlayer) {
    if (this.shouldApplyPolicy(player, PartyName.BUREAUCRATS, 'bp01')) {
      const turmoil = player.game.turmoil;
      if (turmoil !== undefined && turmoil.delegateReserve.has(player)) {
        player.game.defer(new SendDelegateToArea(player, 'Send a delegate in an area (Bureaucrats policy)'));
      }
    }
  }

  static applyTranshumanistsRulingPolicy(player: IPlayer) {
    if (this.shouldApplyPolicy(player, PartyName.TRANSHUMANISTS, 'tp02')) {
      TRANSHUMANISTS_POLICY_2.onStandardProject(player);
    }
  }

  static reds01PolicyInEffect(player: IPlayer) {
    return this.shouldApplyPolicy(player, PartyName.REDS, 'rp01');
  }

  /**
   * Return true when `policy` is active.
   */
  static shouldApplyPolicy(player: IPlayer, partyName: PartyName, policyId: PolicyId): boolean {
    if (player.game.phase !== Phase.ACTION) {
      return false;
    }
    const turmoil = player.game.turmoil;
    if (!turmoil) {
      return false;
    }
    // Hook for CEO Zan's effect (Skip all Reds Policy effects)
    if (partyName === PartyName.REDS && player.tableau.has(CardName.ZAN)) {
      return false;
    }

    // Mars Alliance hook, always apply a policy when player is allied.
    // Reds policy is excluded as its passive effect is negative and its application is optional.
    const alliedPartyPolicy = player.alliedParty?.agenda.policyId;
    if (policyId === alliedPartyPolicy && player.alliedParty?.partyName !== PartyName.REDS) {
      return true;
    }
    const currentPolicyId = PoliticalAgendas.currentAgenda(turmoil).policyId;
    return turmoil.rulingParty.name === partyName && currentPolicyId === policyId;
  }
}
