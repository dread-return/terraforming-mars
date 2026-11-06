import {CardName} from '../../../common/cards/CardName';
import {IPlayer} from '../../IPlayer';
import {SelectAmount} from '../../inputs/SelectAmount';

/**
 * SMES Technology and Tharsis Pumping Hub (Rob Antilles) let a player keep some energy
 * during the production phase instead of converting it all to heat. The capacities don't stack.
 */
/**
 * Converts `amount` of `player`'s energy into heat during the production phase.
 * Condensation Plant (Solaris) gives 1 extra heat for each energy converted.
 */
export function convertEnergyToHeat(player: IPlayer, amount: number, options?: {log?: boolean}) {
  player.energy -= amount;
  player.heat += amount;
  if (options?.log === true) {
    player.game.log('${0} converted ${1}:r:energy: to :r:heat:', (b) => b.player(player).number(amount));
  }
  if (amount > 0 && player.tableau.has(CardName.CONDENSATION_PLANT)) {
    player.heat += amount;
    player.game.log('${0} gained ${1}:r:heat: from ${2}', (b) => b.player(player).number(amount).cardName(CardName.CONDENSATION_PLANT));
  }
}

export function energyStorageCapacity(player: IPlayer): number {
  let capacity = 0;
  if (player.tableau.has(CardName.SMES_TECHNOLOGY)) {
    capacity = Math.max(capacity, 3);
  }
  if (player.tableau.has(CardName.THARSIS_PUMPING_HUB)) {
    capacity = Math.max(capacity, 4);
  }
  return capacity;
}

export function onProductionWithEnergyStorage(player: IPlayer) {
  const capacity = energyStorageCapacity(player);
  const mustConvert = Math.max(0, player.energy - capacity);
  if (mustConvert === player.energy) {
    convertEnergyToHeat(player, player.energy);
    player.finishProductionPhase();
    return;
  }
  player.defer(
    new SelectAmount(`Select amount of energy to convert to heat (keep up to ${capacity})`, 'OK', mustConvert, player.energy, true)
      .andThen((amount) => {
        convertEnergyToHeat(player, amount, {log: true});
        player.finishProductionPhase();
        return undefined;
      }));
}
