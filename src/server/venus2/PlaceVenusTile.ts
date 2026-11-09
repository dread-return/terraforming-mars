import {Space} from '../boards/Space';
import {DeferredAction} from '../deferredActions/DeferredAction';
import {Priority} from '../deferredActions/Priority';
import {SelectSpace} from '../inputs/SelectSpace';
import {IPlayer} from '../IPlayer';
import {TileType} from '../../common/TileType';
import {CardName} from '../../common/cards/CardName';
import {VenusPhase2Expansion, VenusTileType} from './VenusPhase2Expansion';

const TITLES: Record<VenusTileType | TileType.CITY, string> = {
  [TileType.VENUS_FLOATING_ARRAY]: 'Select a space on Venus for a Floating Array',
  [TileType.VENUS_GAS_MINE]: 'Select a yellow space on Venus for a Gas Mine',
  [TileType.VENUS_HABITAT]: 'Select a space on Venus for a Venus Habitat',
  [TileType.CITY]: 'Select a space on Venus for a city',
};

/** Places a Venus tile (or a city) on the Venus map. Venus tiles also raise Venus 1 step. */
export class PlaceVenusTile extends DeferredAction<Space> {
  constructor(
    player: IPlayer,
    private readonly tileType: VenusTileType | TileType.CITY,
    private readonly card?: CardName,
  ) {
    super(player, Priority.DEFAULT);
  }

  public execute() {
    if (!VenusPhase2Expansion.isActive(this.player.game)) {
      return undefined;
    }
    const spaces = VenusPhase2Expansion.availableSpaces(this.player, this.tileType);
    if (spaces.length === 0) {
      this.player.game.log('${0} found no space on Venus for the tile', (b) => b.player(this.player));
      return undefined;
    }
    return new SelectSpace(TITLES[this.tileType], spaces)
      .andThen((space) => {
        VenusPhase2Expansion.addTile(this.player, space.id, {tileType: this.tileType, card: this.card});
        this.cb(space);
        return undefined;
      });
  }
}
