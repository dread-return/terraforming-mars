import {Payment, PaymentOptions} from '../../common/inputs/Payment';
import {SPENDABLE_RESOURCES, SpendableResource} from '../../common/inputs/Spendable';
import {Random} from '../../common/utils/Random';
import {Units} from '../../common/Units';
import {IPlayer} from '../IPlayer';

type Options = Partial<PaymentOptions> & {steelValue?: number, grapheneValue?: number};

/**
 * Builds a payment worth at least `cost` M€ from what `player` can spend, or undefined when the player cannot pay.
 *
 * The value of each resource comes from `player.payingAmount`, so every rule that decides what counts (steel for
 * building tags, Helion's heat, Luna Trade Federation...) stays in one place. A resource the options don't allow is
 * worth 0 and is skipped.
 *
 * @param attempt 0 spends M€ first. Higher attempts shuffle the order, and half of them leave M€ for last, so retries
 * try other ways to pay (and so exercise the other payment rules).
 */
export function autoPayment(
  player: IPlayer,
  cost: number,
  options: Options,
  reserveUnits: Units | undefined,
  rng: Random,
  attempt: number): Payment | undefined {
  const payment: Payment = {...Payment.EMPTY};
  if (cost <= 0) {
    return payment;
  }
  const max = player.maxSpendable(reserveUnits);

  const others = SPENDABLE_RESOURCES.filter((r) => r !== 'megacredits');
  let order: Array<SpendableResource>;
  if (attempt === 0) {
    order = ['megacredits', ...others];
  } else {
    const shuffled = [...others];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = rng.nextInt(i + 1);
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    order = rng.next() < 0.5 ? ['megacredits', ...shuffled] : [...shuffled, 'megacredits'];
  }

  let remaining = cost;
  for (const resource of order) {
    if (remaining <= 0) {
      break;
    }
    if (max[resource] <= 0) {
      continue;
    }
    const value = player.payingAmount({...Payment.EMPTY, [resource]: 1}, options);
    if (value <= 0) {
      continue;
    }
    const units = Math.min(max[resource], Math.ceil(remaining / value));
    payment[resource] = units;
    remaining -= units * value;
  }
  return remaining <= 0 ? payment : undefined;
}
