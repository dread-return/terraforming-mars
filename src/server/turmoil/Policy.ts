import {IProjectCard} from '../cards/IProjectCard';
import {IGame} from '../IGame';
import {Space} from '../boards/Space';
import {IPlayer} from '../IPlayer';
import {PlayerInput} from '../PlayerInput';
import {PolicyId} from '../../common/turmoil/Types';
import {GlobalParameter} from '../../common/GlobalParameter';
import {Resource} from '../../common/Resource';
import {Tag} from '../../common/cards/Tag';

// Represents a Turmoil policy.
export interface IPolicy {
  id: PolicyId;
  description: string | ((player: IPlayer | undefined) => string);
  onTilePlaced?(player: IPlayer, space: Space): void;
  onCardPlayed?(player: IPlayer, card: IProjectCard): void;
  /** Giga Turmoil: `player` used a standard project. */
  onStandardProject?(player: IPlayer): void;
  /** Giga Turmoil: `player` raised a Mars global parameter (oxygen, temperature or oceans) by `steps`. */
  onMarsParameterRaised?(player: IPlayer, parameter: GlobalParameter, steps: number): void;
  /** Giga Turmoil: `player` raised or lowered a production by `delta` (never 0). */
  onProductionChanged?(player: IPlayer, resource: Resource, delta: number): void;
  /** Giga Turmoil: `player` placed a delegate. */
  onDelegatePlaced?(player: IPlayer): void;
  /** Giga Turmoil: `player` starts a turn. */
  onTurnStart?(player: IPlayer): void;
  /** Giga Turmoil: the most actions on cards in play that each player may take this generation, if limited. */
  cardActionLimit?(player: IPlayer): number;
  /** Giga Turmoil: every player is considered to have this many more of `tag`. */
  tagBonus?(player: IPlayer, tag: Tag): number;
  /** Giga Turmoil: how many M€ a unit of energy is worth when paying. When set, energy may be spent as M€. */
  readonly energyValue?: number;
  /** Giga Turmoil: titanium is worth this many more M€. */
  readonly titaniumValueBonus?: number;
  /** Giga Turmoil: global parameter requirements are adjustable by this much. */
  readonly requirementBonus?: number;
  action?(player: IPlayer): PlayerInput | undefined;
  canAct?(player: IPlayer): boolean;
  onPolicyStart?(game: IGame): void;
  onPolicyStartForPlayer?(player: IPlayer): void;
  onPolicyEnd?(game: IGame): void;
  onPolicyEndForPlayer?(player: IPlayer): void;
}

export abstract class Policy implements IPolicy {
  abstract readonly id: PolicyId;
  abstract readonly description: string | ((player: IPlayer | undefined) => string);

  public onPolicyStart(game: IGame): void {
    game.playersInGenerationOrder.forEach((p) => this.onPolicyStartForPlayer(p));
  }

  public abstract onPolicyStartForPlayer(_player: IPlayer): void;

  public onPolicyEnd(game: IGame): void {
    game.playersInGenerationOrder.forEach((p) => this.onPolicyEndForPlayer(p));
  }

  public abstract onPolicyEndForPlayer(_player: IPlayer): void;
}

export function policyDescription(policy: IPolicy, player: IPlayer | undefined): string {
  return typeof(policy.description) === 'string' ? policy.description : policy.description(player);
}
