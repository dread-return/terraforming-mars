import {IPlayer} from '../../IPlayer';
import {StandardProjectCard} from '../StandardProjectCard';
import {Payment} from '../../../common/inputs/Payment';
import {StandardProjectCanPayWith} from '../../../common/cards/Types';
import {CardName} from '../../../common/cards/CardName';
import {CardMetadata} from '../../../common/cards/CardMetadata';
import {VenusPhase2Expansion, VenusTileType} from '../../venus2/VenusPhase2Expansion';
import {PlaceVenusTile} from '../../venus2/PlaceVenusTile';
import {RemoveOwnCardResources} from '../../venus2/RemoveOwnCardResources';
import {CardResource} from '../../../common/CardResource';
import {IStandardProjectCard} from '../IStandardProjectCard';
import {MoonExpansion} from '../../moon/MoonExpansion';
import {Eternity} from '../eternity/Eternity';

export const VENUS_STANDARD_PROJECTS: ReadonlySet<CardName> = new Set([
  CardName.FLOATING_ARRAY_STANDARD_PROJECT,
  CardName.GAS_MINE_STANDARD_PROJECT,
  CardName.CLOUD_CITY_STANDARD_PROJECT,
]);

export function isVenusStandardProject(card: IStandardProjectCard): boolean {
  return VENUS_STANDARD_PROJECTS.has(card.name);
}

/**
 * Venus Phase 2 standard projects: place a Venus tile (raising Venus 1 step).
 * Floaters from any of your cards can pay, 3 M€ each.
 */
export abstract class VenusStandardProject extends StandardProjectCard {
  constructor(properties: {name: CardName, cost: number, metadata: CardMetadata}, private readonly tileType: VenusTileType) {
    super({...properties, tr: {venus: 1}});
  }

  public override canPayWith(): StandardProjectCanPayWith {
    return {floaters: true};
  }

  protected override bespokeCanAct(player: IPlayer): boolean {
    return VenusPhase2Expansion.isActive(player.game) &&
      VenusPhase2Expansion.availableSpaces(player, this.tileType).length > 0;
  }

  public override canAct(player: IPlayer): boolean {
    this.clearWarnings();
    if (!this.bespokeCanAct(player)) {
      return false;
    }
    const floaterCredit = VenusPhase2Expansion.floatersOnCards(player) * VenusPhase2Expansion.floaterValue(player);
    return player.canAfford({
      cost: Math.max(0, this.getAdjustedCost(player) - floaterCredit - Eternity.standardProjectHeatCredit(player, this)),
      tr: this.tr,
      auroraiData: true,
      spireScience: true,
      reserveUnits: MoonExpansion.adjustedReserveCosts(player, this),
    });
  }

  public override payAndExecute(player: IPlayer, payment: Payment): void {
    const floaters = payment.floaters;
    player.pay({...payment, floaters: 0});
    if (floaters > 0) {
      player.game.defer(new RemoveOwnCardResources(player, CardResource.FLOATER, floaters));
    }
    this.projectPlayed(player);
    this.actionEssence(player);
  }

  protected placeTile(player: IPlayer) {
    player.game.defer(new PlaceVenusTile(player, this.tileType));
  }
}
