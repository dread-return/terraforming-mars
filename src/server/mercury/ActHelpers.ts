import {CardResource} from '../../common/CardResource';
import {Resource} from '../../common/Resource';
import {Space} from '../boards/Space';
import {IPlayer} from '../IPlayer';
import {SelectCard} from '../inputs/SelectCard';
import {SelectSpace} from '../inputs/SelectSpace';
import {SelectAmount} from '../inputs/SelectAmount';
import {AddResourcesToCard} from '../deferredActions/AddResourcesToCard';
import {message} from '../logs/MessageBuilder';

/** Helpers shared by several Act cards. */
export class ActHelpers {
  /**
   * Reserves `count` connected non-reserved land areas on Mars for `player` (like Land Claim).
   * With `fromOwnTiles`, the first area must be next to one of the player's tiles.
   * With `gainBonuses`, the player gets the placement bonus of each area.
   */
  public static reserveConnected(player: IPlayer, count: number, options: {fromOwnTiles: boolean, gainBonuses: boolean}): void {
    const reserved: Array<Space> = [];
    const step = (remaining: number): void => {
      if (remaining <= 0) {
        return;
      }
      player.defer(() => {
        const board = player.game.board;
        let spaces = board.getNonReservedLandSpaces();
        if (reserved.length > 0) {
          spaces = spaces.filter((s) => reserved.some((r) => board.getAdjacentSpaces(r).includes(s)));
        } else if (options.fromOwnTiles) {
          const own = board.spaces.filter((s) => s.player === player && s.tile !== undefined);
          spaces = spaces.filter((s) => own.some((o) => board.getAdjacentSpaces(o).includes(s)));
        }
        if (spaces.length === 0) {
          player.game.log('${0} has no more connected areas to reserve', (b) => b.player(player));
          return undefined;
        }
        return new SelectSpace(message('Select an area to reserve (${0} left)', (b) => b.number(remaining)), spaces).andThen((space) => {
          space.player = player;
          reserved.push(space);
          player.game.log('${0} reserved an area', (b) => b.player(player));
          if (options.gainBonuses) {
            player.game.grantSpaceBonuses(player, space);
          }
          step(remaining - 1);
          return undefined;
        });
      });
    };
    step(count);
  }

  /** Moves up to `max` resources of `type` from `from`'s cards to cards of `to`. */
  public static stealCardResources(to: IPlayer, from: IPlayer, type: CardResource, max: number): void {
    to.defer(() => {
      const sources = from.getCardsWithResources(type);
      if (sources.length === 0) {
        return undefined;
      }
      return new SelectCard(message('Select a card of ${0} to take ${1} from', (b) => b.player(from).string(type)), 'Take', sources).andThen(([source]) => {
        const available = Math.min(max, source.resourceCount);
        const take = (n: number) => {
          from.removeResourceFrom(source, n, {removingPlayer: to, log: true});
          to.game.defer(new AddResourcesToCard(to, type, {count: n}));
        };
        if (available <= 1) {
          take(available);
          return undefined;
        }
        return new SelectAmount(message('Take how many ${0}?', (b) => b.string(type)), 'Take', 1, available, true).andThen((n) => {
          take(n);
          return undefined;
        });
      });
    });
  }

  /** Removes up to `max` resources of `type` from `from`'s cards. */
  public static removeCardResources(remover: IPlayer, from: IPlayer, type: CardResource, max: number): void {
    remover.defer(() => {
      const sources = from.getCardsWithResources(type);
      if (sources.length === 0) {
        return undefined;
      }
      return new SelectCard(message('Select a card of ${0} to remove ${1} from', (b) => b.player(from).string(type)), 'Remove', sources).andThen(([source]) => {
        from.removeResourceFrom(source, Math.min(max, source.resourceCount), {removingPlayer: remover, log: true});
        return undefined;
      });
    });
  }

  /** `player` pays up to `amount` M€ (as much as they have). */
  public static payUpTo(player: IPlayer, amount: number): void {
    const paid = Math.min(Math.max(player.megaCredits, 0), amount);
    if (paid > 0) {
      player.stock.deduct(Resource.MEGACREDITS, paid, {log: true});
    }
  }

  /** Lowers a production of `player` by `amount`, as far as it can go (M€ production stops at -5). */
  public static lowerProduction(player: IPlayer, resource: Resource, amount: number): void {
    const floor = resource === Resource.MEGACREDITS ? -5 : 0;
    const lowered = Math.min(amount, player.production.get(resource) - floor);
    if (lowered > 0) {
      player.production.add(resource, -lowered, {log: true});
    }
  }
}
