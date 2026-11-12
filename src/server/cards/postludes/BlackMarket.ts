import {CardName} from '../../../common/cards/CardName';
import {CardType} from '../../../common/cards/CardType';
import {CardRenderer} from '../render/CardRenderer';
import {PostludeCard} from './PostludeCard';
import {IActionCard} from '../ICard';
import {IPlayer} from '../../IPlayer';
import {InputError} from '../../inputs/InputError';
import {SelectResources} from '../../inputs/SelectResources';
import {Units} from '../../../common/Units';
import {sum} from '../../../common/utils/utils';

export class BlackMarket extends PostludeCard implements IActionCard {
  constructor() {
    super({
      name: CardName.BLACK_MARKET,
      type: CardType.ACTIVE,
      cost: 0,
      tags: [],
      postludeKind: 'city',

      metadata: {
        cardNumber: 'L18',
        renderData: CardRenderer.builder((b) => {
          b.action('Spend 3 standard resources to get any 3 standard resources.', (ab) => ab.wild(3).startAction.wild(3));
        }),
        description: 'Place the Black Market tile on top of one of your cities. Action: spend 3 standard resources to get any 3 standard resources.',
      },
    });
  }

  public canAct(player: IPlayer): boolean {
    return sum(Units.values(player.stock.asUnits())) >= 3;
  }

  public action(player: IPlayer) {
    return new SelectResources('Select 3 standard resources to spend', 3).andThen((spent) => {
      if (!player.stock.has(spent)) {
        throw new InputError('You do not have those resources');
      }
      return new SelectResources('Select 3 standard resources to gain', 3).andThen((gained) => {
        player.stock.deductUnits(spent);
        player.stock.adjust(gained, {log: true});
        player.game.log('${0} traded 3 resources at the ${1}', (b) => b.player(player).card(this));
        return undefined;
      });
    });
  }
}
