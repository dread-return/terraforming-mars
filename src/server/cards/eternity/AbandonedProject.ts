import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {CardType} from '../../../common/cards/CardType';
import {Card} from '../Card';
import {IPlayer} from '../../IPlayer';
import {IProjectCard} from '../IProjectCard';
import {Resource} from '../../../common/Resource';
import {SelectSpace} from '../../inputs/SelectSpace';
import {Tag} from '../../../common/cards/Tag';
import {TileType} from '../../../common/TileType';
import {isSpecialTileSpace} from '../../boards/Board';

export class AbandonedProject extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.AUTOMATED,
      name: CardName.ABANDONED_PROJECT,
      tags: [Tag.PLANT, Tag.BUILDING],
      cost: 18,
      metadata: {
        cardNumber: 'E39',
        renderData: CardRenderer.builder((b) => {
          b.text('Replace one of your special tiles with a greenery:').greenery().br.steel(3);
        }),
        description: 'Requires that you own a special tile. Replace it with a greenery tile, gain its placement bonuses and raise oxygen 1 step. Gain 3 steel.',
      },
    });
  }

  private spaces(player: IPlayer) {
    return player.game.board.spaces.filter((s) => s.player === player && s.tile !== undefined && isSpecialTileSpace(s) && s.spaceType !== 'ocean');
  }
  public override bespokeCanPlay(player: IPlayer) {
    return this.spaces(player).length > 0;
  }
  public override bespokePlay(player: IPlayer) {
    if (this.spaces(player).length === 0) {
      return undefined;
    }
    return new SelectSpace('Select one of your special tiles to replace with a greenery', this.spaces(player)).andThen((space) => {
      space.tile = {tileType: TileType.GREENERY};
      player.game.grantPlacementBonuses(player, space);
      player.game.increaseOxygenLevel(player, 1);
      player.stock.add(Resource.STEEL, 3, {log: true});
      return undefined;
    });
  }
}
