import {CardName} from '../../../common/cards/CardName';
import {CardType} from '../../../common/cards/CardType';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {Card} from '../Card';
import {IProjectCard} from '../IProjectCard';
import {IPlayer} from '../../IPlayer';
import {Mercury} from '../../mercury/Mercury';

export class TradepostBase extends Card implements IProjectCard {
  constructor() {
    super({
      name: CardName.TRADEPOST_BASE,
      type: CardType.AUTOMATED,
      tags: [Tag.CITY, Tag.BUILDING],
      cost: 22,
      behavior: {
        production: {energy: -1, megacredits: 4},
        city: {},
      },
      metadata: {
        cardNumber: 'MM36',
        renderData: CardRenderer.builder((b) => {
          b.production((pb) => pb.minus().energy(1).br.plus().megacredits(4)).city().asset(3);
        }),
        description: 'Place a city tile on Mars. Decrease your energy production 1 step and increase your M€ production 4 steps. Add 3 assets to an Act.',
      },
    });
  }

  public override bespokePlay(player: IPlayer) {
    Mercury.gainAssets(player, 3);
    return undefined;
  }
}
