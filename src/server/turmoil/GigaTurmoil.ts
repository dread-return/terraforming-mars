import {IPlayer} from '../IPlayer';
import {Board} from '../boards/Board';
import {MoonExpansion} from '../moon/MoonExpansion';
import {TileType} from '../../common/TileType';
import {Bonus, IBonus} from './Bonus';
import {IPolicy} from './Policy';
import {BonusId, PolicyId} from '../../common/turmoil/Types';

/**
 * Helpers shared by the Giga Turmoil parties (the six extra parties from the GIGA expansion).
 */

/**
 * Number of off-world cities `player` owns: cities on off-Mars spaces (space cities such as Ganymede
 * Colony or Stanford Torus, cities on the Venus map), Venus Habitats and Moon Habitats.
 */
export function countOffWorldCities(player: IPlayer): number {
  const game = player.game;
  const spaces = new Set<string>();
  for (const space of game.board.getCitiesOffMars(player)) {
    spaces.add(space.id);
  }
  for (const space of game.board.venusMap?.spaces ?? []) {
    if (space.tile?.tileType === TileType.VENUS_HABITAT && Board.spaceOwnedBy(space, player)) {
      spaces.add(space.id);
    }
  }
  for (const space of MoonExpansion.spaces(game, TileType.MOON_HABITAT, {ownedBy: player})) {
    spaces.add(space.id);
  }
  return spaces.size;
}

/** Number of delegates `player` has placed in the parties (not counting the reserve or the chairman seat). */
export function countDelegatesInParties(player: IPlayer): number {
  const turmoil = player.game.turmoil;
  if (turmoil === undefined) {
    return 0;
  }
  let count = 0;
  for (const party of turmoil.parties) {
    count += party.delegates.get(player);
  }
  return count;
}

/**
 * A bonus whose card icon has not been decoded yet. It does nothing, and says so, so a party
 * is never left without a bonus to choose.
 */
export class PendingBonus extends Bonus implements IBonus {
  constructor(public readonly id: BonusId) {
    super();
  }
  public readonly description = 'No effect yet (this card is not decoded yet)';
  public getScore(): number {
    return 0;
  }
  public grantForPlayer(): void {
    // Nothing to do.
  }
}

/** The policy equivalent of PendingBonus. */
export class PendingPolicy implements IPolicy {
  constructor(public readonly id: PolicyId) {}
  public readonly description = 'No effect yet (this card is not decoded yet)';
}
