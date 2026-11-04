import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {IActionCard} from '../ICard';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {SelectAmount} from '../../inputs/SelectAmount';
import {Resource} from '../../../common/Resource';

export class AitkenDrillingOperations extends Card implements IProjectCard, IActionCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.AITKEN_DRILLING_OPERATIONS,
      tags: [Tag.SCIENCE, Tag.MOON, Tag.SPACE],
      cost: 31,
      requirements: {tag: Tag.SCIENCE, count: 5},
      victoryPoints: 2,

      behavior: {
        production: {steel: 3},
      },

      metadata: {
        cardNumber: 'B54',
        renderData: CardRenderer.builder((b) => {
          b.action('Spend any amount of steel to gain that amount of titanium.', (eb) => {
            eb.text('x').steel(1).startAction.text('x').titanium(1);
          }).br;
          b.production((pb) => pb.steel(3));
        }),
        description: 'Requires 5 science tags. Increase your steel production 3 steps.',
      },
    });
  }

  public canAct(player: IPlayer) {
    return player.steel > 0;
  }

  public action(player: IPlayer) {
    return new SelectAmount('Select amount of steel to spend', 'Spend steel', 1, player.steel)
      .andThen((amount) => {
        player.stock.deduct(Resource.STEEL, amount);
        player.stock.add(Resource.TITANIUM, amount, {log: true});
        return undefined;
      });
  }
}
