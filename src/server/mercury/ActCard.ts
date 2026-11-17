import {CardType} from '../../common/cards/CardType';
import {ActKind} from '../../common/mercury/Mercury';
import {Card, StaticCardProperties} from '../cards/Card';
import {IProjectCard} from '../cards/IProjectCard';
import {ICard} from '../cards/ICard';
import {IPlayer} from '../IPlayer';
import {PlayerInput} from '../PlayerInput';
import {Behavior} from '../behavior/Behavior';
import {getBehaviorExecutor} from '../behavior/BehaviorExecutor';

/**
 * How an Act was resolved.
 *
 * For a Treaty, `owner` is the initiator, who takes the card. `other` is the co-developer.
 * For a Rivalry, `owner` is the victor and `other` the defeated player.
 * `other` is undefined when an Act is resolved "in your favour" (New Pompeii), with nobody else.
 */
export type ActResolution = {
  owner: IPlayer;
  other: IPlayer | undefined;
};

export type ActCardProperties = Omit<StaticCardProperties, 'type' | 'cost'> & {
  kind: ActKind;
  /** Assets needed to resolve. A number for both tracks, or [initiator's track, partner's track]. */
  steps: number | [number, number];
  /** Treaty "Resolve (both)": done for each of the two players. */
  bothBehavior?: Behavior;
  /** Rivalry "Victory": done for the victor. */
  victoryBehavior?: Behavior;
  /** Rivalry "Defeat": done for the defeated player. */
  defeatBehavior?: Behavior;
};

export interface IActCard extends IProjectCard {
  readonly kind: ActKind;
  readonly steps: [number, number];
  /** True when `initiator` may develop this Act with (or against) `other`. Checked when it goes into development. */
  canDevelop(initiator: IPlayer, other: IPlayer): boolean;
  /** Set by the Mercury engine right before the card is played. */
  resolution: ActResolution | undefined;
}

export function isActCard(card: ICard): card is IActCard {
  return card.type === CardType.ACT;
}

/**
 * Base class for Act cards.
 *
 * An Act is resolved by playing it into the owner's played cards (its tags count like those of a green card).
 * Playing it runs `resolveTreaty` or `victory` + `defeat`.
 */
export abstract class ActCard extends Card implements IActCard {
  public readonly kind: ActKind;
  public readonly steps: [number, number];
  private readonly bothBehavior: Behavior | undefined;
  private readonly victoryBehavior: Behavior | undefined;
  private readonly defeatBehavior: Behavior | undefined;
  public resolution: ActResolution | undefined = undefined;

  constructor(properties: ActCardProperties) {
    const {kind, steps, bothBehavior, victoryBehavior, defeatBehavior, ...rest} = properties;
    super({...rest, type: CardType.ACT});
    this.kind = kind;
    this.steps = typeof steps === 'number' ? [steps, steps] : steps;
    this.bothBehavior = bothBehavior;
    this.victoryBehavior = victoryBehavior;
    this.defeatBehavior = defeatBehavior;
  }

  public canDevelop(_initiator: IPlayer, _other: IPlayer): boolean {
    return true;
  }

  /** Treaty: what each of the two players gets. */
  public resolveFor(player: IPlayer, _other: IPlayer | undefined): void {
    if (this.bothBehavior !== undefined) {
      getBehaviorExecutor().execute(this.bothBehavior, player, this);
    }
  }

  /** Treaty: by default both players get `resolveFor`. Cards that say "Resolve:" (not both) override this. */
  public resolveTreaty(owner: IPlayer, other: IPlayer | undefined): void {
    this.resolveFor(owner, other);
    if (other !== undefined) {
      this.resolveFor(other, owner);
    }
  }

  /** Rivalry: what the victor gets. */
  public victory(victor: IPlayer, _defeated: IPlayer | undefined): void {
    if (this.victoryBehavior !== undefined) {
      getBehaviorExecutor().execute(this.victoryBehavior, victor, this);
    }
  }

  /** Rivalry: what the defeated player gets. */
  public defeat(defeated: IPlayer, _victor: IPlayer): void {
    if (this.defeatBehavior !== undefined) {
      getBehaviorExecutor().execute(this.defeatBehavior, defeated, this);
    }
  }

  public override bespokePlay(player: IPlayer): PlayerInput | undefined {
    const resolution = this.resolution ?? {owner: player, other: undefined};
    this.resolution = undefined;
    if (this.kind === 'treaty') {
      this.resolveTreaty(resolution.owner, resolution.other);
    } else {
      this.victory(resolution.owner, resolution.other);
      if (resolution.other !== undefined) {
        this.defeat(resolution.other, resolution.owner);
      }
    }
    return undefined;
  }
}
