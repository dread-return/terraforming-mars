import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {PreludeCard} from '../prelude/PreludeCard';
import {SelectSpace} from '../../inputs/SelectSpace';
import {Tag} from '../../../common/cards/Tag';
import {TileType} from '../../../common/TileType';

export class FlowstoneCave extends PreludeCard {
  constructor() {
    super({
      name: CardName.FLOWSTONE_CAVE,
      tags: [Tag.SCIENCE],
      victoryPoints: 2,
      tilesBuilt: [TileType.FLOWSTONE_CAVE],
      behavior: {
        tr: 1,
      },
      metadata: {
        cardNumber: 'EP17',
        renderData: CardRenderer.builder((b) => {
          b.tile(TileType.FLOWSTONE_CAVE, false, false).asterix().tr(1);
        }),
        description: 'Place the Flowstone Cave special tile next to a volcanic area. Raise your TR 1 step.',
      },
    });
  }

  private spaces(player: IPlayer) {
    const board = player.game.board;
    const land = board.getAvailableSpacesOnLand(player);
    const nextToVolcano = land.filter((s) => board.getAdjacentSpaces(s).some((a) => a.volcanic === true));
    return nextToVolcano.length > 0 ? nextToVolcano : land;
  }
  public override bespokeCanPlay(player: IPlayer) {
    return this.spaces(player).length > 0;
  }
  public override bespokePlay(player: IPlayer) {
    player.defer(new SelectSpace('Select space next to a volcanic area for Flowstone Cave', this.spaces(player)).andThen((space) => {
      player.game.addTile(player, space, {tileType: TileType.FLOWSTONE_CAVE, card: this.name});
      return undefined;
    }));
    return undefined;
  }
}
