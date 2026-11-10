import {LawSuit} from '../cards/promo/LawSuit';
import {Resource} from '../../common/Resource';
import {From, isFromPlayer} from '../logs/From';
import {BaseStock} from './StockBase';
import {IPlayer} from '../IPlayer';
import {PRODUCTION_MINIMUMS} from '../../common/constants';
import {CardName} from '../../common/cards/CardName';
import {Units} from '../../common/Units';
import {Eternity} from '../cards/eternity/Eternity';

export class Production extends BaseStock {
  constructor(player: IPlayer) {
    super(player, PRODUCTION_MINIMUMS.megacredits);
  }
  /** ORC Turbines (Rob Antilles): a missing energy production step may be paid with 2 heat production steps. */
  private orcShortfall(resource: Resource, amount: number, from?: From): number {
    if (resource !== Resource.ENERGY || amount >= 0 || !this.player.tableau.has(CardName.ORC_TURBINES)) {
      return 0;
    }
    if (isFromPlayer(from) && from.player.id !== this.player.id) {
      return 0;
    }
    return Math.max(0, -amount - this.energy);
  }

  public override canAdjust(units: Units): boolean {
    if (units.energy < 0 && this.energy + units.energy < 0 && this.player.tableau.has(CardName.ORC_TURBINES)) {
      const shortfall = -(this.energy + units.energy);
      return super.canAdjust({...units, energy: -this.energy, heat: units.heat - 2 * shortfall});
    }
    return super.canAdjust(units);
  }

  public add(
    resource: Resource,
    amount : number,
    options? : { log: boolean, from? : From, stealing?: boolean},
  ) {
    const shortfall = this.orcShortfall(resource, amount, options?.from);
    if (shortfall > 0 && this.heat >= 2 * shortfall) {
      this.add(Resource.HEAT, -2 * shortfall, options);
      amount += shortfall;
      if (amount === 0) {
        return;
      }
    }
    const adj = PRODUCTION_MINIMUMS[resource];
    const delta = (amount >= 0) ? amount : Math.max(amount, -(this[resource] - adj));
    this[resource] += delta;

    if (options?.log === true) {
      this.logUnitDelta(resource, amount, /* production*/ true, options.from, options.stealing);
    }

    const from = options?.from;
    if (isFromPlayer(from)) {
      LawSuit.resourceHook(this.player, delta, from.player);

      // Mons Insurance hook
      if (delta < 0 && from.player.id !== this.player.id) {
        this.player.resolveInsurance();
      }
    }

    for (const card of this.player.tableau) {
      card.onProductionGain?.(this.player, resource, amount);
    }
    Eternity.onProductionGain(this.player, resource, amount);
  }
}
