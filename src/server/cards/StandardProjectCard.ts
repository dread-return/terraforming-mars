import {Postludes} from '../postludes/Postludes';
import {CardType} from '../../common/cards/CardType';
import {GigaHooks} from '../turmoil/giga/GigaHooks';
import {IPlayer} from '../IPlayer';
import {TRSource} from '../../common/cards/TRSource';
import {CardMetadata} from '../../common/cards/CardMetadata';
import {CardName} from '../../common/cards/CardName';
import {Card} from './Card';
import {MoonExpansion} from '../moon/MoonExpansion';
import {Units} from '../../common/Units';
import {IStandardProjectCard} from './IStandardProjectCard';
import {sum} from '../../common/utils/utils';
import {Payment} from '../../common/inputs/Payment';
import {StandardProjectCanPayWith} from '../../common/cards/Types';
import {Space} from '../boards/Space';
import {Eternity} from './eternity/Eternity';

type StaticStandardProjectCardProperties = {
  name: CardName,
  cost: number,
  metadata: CardMetadata,
  reserveUnits?: Partial<Units>,
  tr?: TRSource,
}


export abstract class StandardProjectCard extends Card implements IStandardProjectCard {
  constructor(properties: StaticStandardProjectCardProperties) {
    super({
      type: CardType.STANDARD_PROJECT,
      ...properties,
    });
  }

  public override get type(): CardType.STANDARD_PROJECT {
    return CardType.STANDARD_PROJECT;
  }

  protected discount(_player: IPlayer) {
    return 0;
  }

  public getAdjustedCost(player: IPlayer) {
    const discountFromCards =
      sum(player.tableau.asArray()
        .map((card) => card.getStandardProjectDiscount?.(player, this) ?? 0));
    const discount = discountFromCards + this.discount(player);
    const adjusted = Math.max(0, this.cost - discount + Eternity.standardProjectCostAdjustment(player, this));
    return adjusted;
  }

  protected abstract actionEssence(player: IPlayer): void

  public onStandardProject(player: IPlayer): void {
    for (const playedCard of player.tableau) {
      playedCard.onStandardProject?.(player, this);
    }
    GigaHooks.onStandardProject(player);
    for (const p of player.game.players) {
      for (const playedCard of p.tableau) {
        playedCard.onStandardProjectByAnyPlayer?.(p, player, this);
      }
    }
  }

  protected canPlayOptions(player: IPlayer) {
    const canPayWith = this.allCanPayWith(player);
    return {
      ...canPayWith,
      cost: Math.max(0, this.getAdjustedCost(player) - Eternity.standardProjectHeatCredit(player, this)),
      tr: this.tr,
      auroraiData: true,
      spireScience: true,
      reserveUnits: MoonExpansion.adjustedReserveCosts(player, this),
    };
  }

  public canAct(player: IPlayer): boolean {
    // Warnings reflect the current game state, so recompute them every time.
    this.clearWarnings();
    return this.bespokeCanAct(player) && player.canAfford(this.canPlayOptions(player));
  }

  /**
   * Override to add card-specific checks or warnings. Affordability is handled by `canAct`.
   */
  protected bespokeCanAct(_player: IPlayer): boolean {
    return true;
  }

  public canPayWith(_player: IPlayer): StandardProjectCanPayWith {
    return {};
  }

  /** What this standard project accepts as payment, counting Eternity and postlude effects. */
  private allCanPayWith(player: IPlayer): StandardProjectCanPayWith {
    return Postludes.standardProjectPayWith(player, this, Eternity.standardProjectPayWith(player, this, this.canPayWith(player)));
  }

  /**
   * Set while the project executes when payment with steel or titanium (from Machinery Factory or Metallurgy
   * Workshop) limits where its tile can go. Tile projects pass it to their placement.
   */
  protected placementSpaces: ReadonlyArray<Space> | undefined = undefined;

  public payAndExecute(player: IPlayer, payment: Payment): void {
    const base = Eternity.standardProjectPayWith(player, this, this.canPayWith(player));
    this.placementSpaces = Postludes.placementSpaces(player, this.name, payment, base);
    player.pay(payment);
    this.projectPlayed(player);
    this.actionEssence(player);
    this.placementSpaces = undefined;
  }

  protected projectPlayed(player: IPlayer) {
    player.game.log('${0} used ${1} standard project', (b) => b.player(player).card(this));
    // standardProjectsThisGeneration does not include Sell Patents.
    if (this.name !== CardName.SELL_PATENTS_STANDARD_PROJECT) {
      player.standardProjectsThisGeneration.add(this.name);
    }
    this.onStandardProject(player);
  }
}
