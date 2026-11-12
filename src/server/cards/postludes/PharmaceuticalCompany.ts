import {CardName} from '../../../common/cards/CardName';
import {CardType} from '../../../common/cards/CardType';
import {CardRenderer} from '../render/CardRenderer';
import {PostludeCard} from './PostludeCard';
import {Tag} from '../../../common/cards/Tag';
import {IActionCard} from '../ICard';
import {IPlayer} from '../../IPlayer';
import {Resource} from '../../../common/Resource';
import {Size} from '../../../common/cards/render/Size';

export class PharmaceuticalCompany extends PostludeCard implements IActionCard {
  constructor() {
    super({
      name: CardName.PHARMACEUTICAL_COMPANY,
      type: CardType.ACTIVE,
      cost: 9,
      tags: [Tag.SCIENCE],
      postludeKind: 'city',

      metadata: {
        cardNumber: 'L14',
        renderData: CardRenderer.builder((b) => {
          b.action('Get 2 M€ for each tile adjacent to the Pharmaceutical Company.', (ab) => ab.empty().startAction.megacredits(2).slash().emptyTile('normal', {size: Size.SMALL}).asterix());
        }),
        description: 'Place the Pharmaceutical Company tile on top of one of your cities. Action: get 2 M\u20ac for each tile adjacent to the Pharmaceutical Company.',
      },
    });
  }

  public canAct(player: IPlayer): boolean {
    return this.adjacentTiles(player).length > 0;
  }

  public action(player: IPlayer) {
    player.stock.add(Resource.MEGACREDITS, 2 * this.adjacentTiles(player).length, {log: true});
    return undefined;
  }
}
