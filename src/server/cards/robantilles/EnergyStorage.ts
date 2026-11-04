import {CardName} from '../../../common/cards/CardName';
import {IPlayer} from '../../IPlayer';
import {SelectAmount} from '../../inputs/SelectAmount';

/**
 * SMES Technology and Tharsis Pumping Hub (Rob Antilles) let a player keep some energy
 * during the production phase instead of converting it all to heat. The capacities don't stack.
 */
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
    player.heat += player.energy;
    player.energy = 0;
    player.finishProductionPhase();
    return;
  }
  player.defer(
    new SelectAmount(`Select amount of energy to convert to heat (keep up to ${capacity})`, 'OK', mustConvert, player.energy, true)
      .andThen((amount) => {
        player.energy -= amount;
        player.heat += amount;
        player.game.log('${0} converted ${1}:r:energy: to :r:heat:', (b) => b.player(player).number(amount));
        player.finishProductionPhase();
        return undefined;
      }));
}
