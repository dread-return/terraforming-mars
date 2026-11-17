import {CardName} from '../../../common/cards/CardName';
import {CardType} from '../../../common/cards/CardType';
import {Tag} from '../../../common/cards/Tag';
import {TileType} from '../../../common/TileType';
import {Size} from '../../../common/cards/render/Size';
import {CardRenderer} from '../render/CardRenderer';
import {Card} from '../Card';
import {IProjectCard} from '../IProjectCard';
import {IPlayer} from '../../IPlayer';
import {SelectSpace} from '../../inputs/SelectSpace';

export class GeologicalDrilling extends Card implements IProjectCard {
  constructor() {
    super({
      name: CardName.GEOLOGICAL_DRILLING,
      type: CardType.AUTOMATED,
      tags: [Tag.SCIENCE],
      cost: 14,
      tilesBuilt: [TileType.BOREHOLES],
      behavior: {
        ocean: {},
      },
      metadata: {
        cardNumber: 'MM20',
        renderData: CardRenderer.builder((b) => {
          b.tile(TileType.BOREHOLES, false, true).asterix().oceans(1).br;
          b.text('adjacency bonus:', {size: Size.SMALL}).asset(1);
        }),
        description: 'Place the Boreholes special tile on Mars on an area with NO placement bonus. Placing a tile next to it gives 1 asset. Place an ocean tile on Mars.',
      },
    });
  }

  private spaces(player: IPlayer) {
    return player.game.board.getAvailableSpacesOnLand(player).filter((space) => space.bonus.length === 0);
  }

  public override bespokeCanPlay(player: IPlayer) {
    return this.spaces(player).length > 0;
  }

  public override bespokePlay(player: IPlayer) {
    player.defer(() => {
      const spaces = this.spaces(player);
      if (spaces.length === 0) {
        return undefined;
      }
      return new SelectSpace('Select an area with no placement bonus for the Boreholes', spaces).andThen((space) => {
        player.game.addTile(player, space, {tileType: TileType.BOREHOLES, card: this.name});
        return undefined;
      });
    });
    return undefined;
  }
}
