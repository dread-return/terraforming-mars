import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {CardType} from '../../../common/cards/CardType';
import {Card} from '../Card';
import {IPlayer} from '../../IPlayer';
import {IProjectCard} from '../IProjectCard';
import {SelectSpace} from '../../inputs/SelectSpace';
import {Size} from '../../../common/cards/render/Size';
import {Space} from '../../boards/Space';
import {TileType} from '../../../common/TileType';

export class LeveeBreach extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.EVENT,
      name: CardName.LEVEE_BREACH,
      tags: [],
      cost: 2,
      metadata: {
        cardNumber: 'E83',
        renderData: CardRenderer.builder((b) => {
          b.text('Move an ocean tile to an adjacent unoccupied area not reserved for oceans. Gain its placement bonuses, but no TR.', {size: Size.SMALL, isBold: false});
        }),
      },
    });
  }

  private destinations(player: IPlayer, ocean: Space) {
    return player.game.board.getAdjacentSpaces(ocean).filter((s) => s.tile === undefined && s.spaceType === 'land');
  }
  private oceans(player: IPlayer) {
    return player.game.board.spaces.filter((s) => s.tile?.tileType === TileType.OCEAN && this.destinations(player, s).length > 0);
  }
  public override bespokeCanPlay(player: IPlayer) {
    return this.oceans(player).length > 0;
  }
  public override bespokePlay(player: IPlayer) {
    return new SelectSpace('Select an ocean to move', this.oceans(player)).andThen((from) => {
      return new SelectSpace('Select where the ocean flows', this.destinations(player, from)).andThen((to) => {
        const tile = from.tile;
        if (tile === undefined) {
          return undefined;
        }
        from.tile = undefined;
        from.player = undefined;
        to.tile = tile;
        player.game.grantPlacementBonuses(player, to, true);
        player.game.log('${0} moved an ocean', (b) => b.player(player));
        return undefined;
      });
    });
  }
}
