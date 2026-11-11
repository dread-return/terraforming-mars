import {IPlayer} from '../../IPlayer';
import {ICard} from '../../cards/ICard';
import {Space} from '../../boards/Space';
import {Phase} from '../../../common/Phase';
import {PartyName} from '../../../common/turmoil/PartyName';
import {CardName} from '../../../common/cards/CardName';
import {GlobalParameter} from '../../../common/GlobalParameter';
import {Resource} from '../../../common/Resource';
import {Tag} from '../../../common/cards/Tag';
import {IPolicy} from '../Policy';

/**
 * Giga Turmoil runs on one generic dispatcher. Every Epic policy is an IPolicy with a few optional
 * hooks, and the places in the engine that matter (tiles, cards, production, tags and so on) call
 * the matching function here. Outside Giga Turmoil every function does nothing.
 */
export class GigaHooks {
  /**
   * The ruling policy, when Giga Turmoil is in effect and it applies to `player` right now.
   * Like the standard policies, they only apply during the action phase.
   */
  public static activePolicy(player: IPlayer): IPolicy | undefined {
    const game = player.game;
    const turmoil = game?.turmoil;
    if (turmoil === undefined || turmoil.gigaTurmoil !== true || game.phase !== Phase.ACTION) {
      return undefined;
    }
    // CEO Zan skips every Reds policy effect.
    if (turmoil.rulingParty.name === PartyName.REDS && player.tableau.has(CardName.ZAN)) {
      return undefined;
    }
    return turmoil.rulingPolicy();
  }

  public static onTilePlaced(player: IPlayer, space: Space): void {
    this.activePolicy(player)?.onTilePlaced?.(player, space);
  }

  public static onCardPlayed(player: IPlayer, card: ICard): void {
    this.activePolicy(player)?.onCardPlayed?.(player, card as never);
  }

  public static onStandardProject(player: IPlayer): void {
    this.activePolicy(player)?.onStandardProject?.(player);
  }

  /** Called for every global parameter. Only the Mars ones (oxygen, temperature, oceans) count. */
  public static onGlobalParameterIncrease(player: IPlayer, parameter: GlobalParameter, steps: number): void {
    if (parameter !== GlobalParameter.OXYGEN && parameter !== GlobalParameter.TEMPERATURE && parameter !== GlobalParameter.OCEANS) {
      return;
    }
    this.activePolicy(player)?.onMarsParameterRaised?.(player, parameter, steps);
  }

  public static onProductionChanged(player: IPlayer, resource: Resource, delta: number): void {
    if (delta === 0) {
      return;
    }
    this.activePolicy(player)?.onProductionChanged?.(player, resource, delta);
  }

  public static onDelegatePlaced(player: IPlayer): void {
    this.activePolicy(player)?.onDelegatePlaced?.(player);
  }

  public static onTurnStart(player: IPlayer): void {
    this.activePolicy(player)?.onTurnStart?.(player);
  }

  /** The most card actions the player may take this generation, or undefined when not limited. */
  public static cardActionLimit(player: IPlayer): number | undefined {
    return this.activePolicy(player)?.cardActionLimit?.(player);
  }

  public static tagBonus(player: IPlayer, tag: Tag): number {
    return this.activePolicy(player)?.tagBonus?.(player, tag) ?? 0;
  }

  /** M€ value of one energy, when energy can be spent as M€. */
  public static energyValue(player: IPlayer): number | undefined {
    return this.activePolicy(player)?.energyValue;
  }

  public static titaniumValueBonus(player: IPlayer): number {
    return this.activePolicy(player)?.titaniumValueBonus ?? 0;
  }

  public static requirementBonus(player: IPlayer): number {
    return this.activePolicy(player)?.requirementBonus ?? 0;
  }

  /** Reds policy 1: gaining TR costs 3 M€. Shares its handling with the standard Reds policy. */
  public static redsPaysForTerraforming(player: IPlayer): boolean {
    return this.activePolicy(player)?.id === 'Rp01';
  }
}
