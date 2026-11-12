import {IPlayer} from '../IPlayer';
import {SelectSpace} from '../inputs/SelectSpace';
import {Space} from '../boards/Space';
import {DeferredAction} from './DeferredAction';
import {Priority} from './Priority';
import {DomesWilderness} from '../domesWilderness/DomesWilderness';
import {TileUpgrade} from '../../common/domesWilderness/DomesWilderness';

/**
 * Asks the player which of their cities gets a dome, or which of their greeneries gets a wilderness.
 */
export class UpgradeTile extends DeferredAction<Space | undefined> {
  constructor(
    player: IPlayer,
    private upgrade: TileUpgrade,
  ) {
    super(player, Priority.DEFAULT);
  }

  public execute() {
    const spaces = DomesWilderness.upgradeableSpaces(this.player, this.upgrade);
    if (spaces.length === 0) {
      this.cb(undefined);
      return undefined;
    }
    return new SelectSpace(UpgradeTile.title(this.upgrade), spaces)
      .andThen((space) => {
        DomesWilderness.upgrade(this.player, space, this.upgrade);
        this.cb(space);
        return undefined;
      });
  }

  public static title(upgrade: TileUpgrade): string {
    return upgrade === 'dome' ? 'Select one of your cities for the dome' : 'Select one of your greeneries for the wilderness';
  }
}
