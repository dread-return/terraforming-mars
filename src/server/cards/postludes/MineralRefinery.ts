import {CardName} from '../../../common/cards/CardName';
import {CardType} from '../../../common/cards/CardType';
import {CardRenderer} from '../render/CardRenderer';
import {PostludeCard} from './PostludeCard';
import {Tag} from '../../../common/cards/Tag';
import {IActionCard} from '../ICard';
import {IPlayer} from '../../IPlayer';
import {Resource} from '../../../common/Resource';
import {Size} from '../../../common/cards/render/Size';

export class MineralRefinery extends PostludeCard implements IActionCard {
  constructor() {
    super({
      name: CardName.MINERAL_REFINERY,
      type: CardType.ACTIVE,
      cost: 26,
      tags: [Tag.SPACE, Tag.BUILDING],
      postludeKind: 'city',

      metadata: {
        cardNumber: 'L11',
        renderData: CardRenderer.builder((b) => {
          b.action('Get 1 titanium for each empty tile adjacent to the Mineral Refinery.', (ab) => ab.empty().startAction.titanium(1).slash().emptyTile('normal', {size: Size.SMALL}).asterix());
        }),
        description: 'Place the Mineral Refinery tile on top of one of your cities. Action: get 1 titanium for each empty tile adjacent to the Mineral Refinery.',
      },
    });
  }

  public canAct(player: IPlayer): boolean {
    return this.adjacentEmpty(player).length > 0;
  }

  public action(player: IPlayer) {
    player.stock.add(Resource.TITANIUM, this.adjacentEmpty(player).length, {log: true});
    return undefined;
  }
}
