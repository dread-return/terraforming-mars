import {CardName} from '../../../common/cards/CardName';
import {CardType} from '../../../common/cards/CardType';
import {CardRenderer} from '../render/CardRenderer';
import {PostludeCard} from './PostludeCard';
import {Tag} from '../../../common/cards/Tag';
import {IActionCard} from '../ICard';
import {IPlayer} from '../../IPlayer';
import {Resource} from '../../../common/Resource';
import {Size} from '../../../common/cards/render/Size';

export class MiningDepot extends PostludeCard implements IActionCard {
  constructor() {
    super({
      name: CardName.MINING_DEPOT,
      type: CardType.ACTIVE,
      cost: 16,
      tags: [Tag.BUILDING],
      postludeKind: 'city',

      metadata: {
        cardNumber: 'L12',
        renderData: CardRenderer.builder((b) => {
          b.action('Get 1 steel for each empty tile adjacent to the Mining Depot.', (ab) => ab.empty().startAction.steel(1).slash().emptyTile('normal', {size: Size.SMALL}).asterix());
        }),
        description: 'Place the Mining Depot tile on top of one of your cities. Action: get 1 steel for each empty tile adjacent to the Mining Depot. (The printed text says titanium, but the icon shows steel.)',
      },
    });
  }

  public canAct(player: IPlayer): boolean {
    return this.adjacentEmpty(player).length > 0;
  }

  public action(player: IPlayer) {
    player.stock.add(Resource.STEEL, this.adjacentEmpty(player).length, {log: true});
    return undefined;
  }
}
