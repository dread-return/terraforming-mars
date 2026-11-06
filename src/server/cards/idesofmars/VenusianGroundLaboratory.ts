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

export class VenusianGroundLaboratory extends Card implements IProjectCard, IActionCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.VENUSIAN_GROUND_LABORATORY,
      tags: [Tag.VENUS, Tag.BUILDING],
      cost: 8,
      requirements: {venus: 8},
      victoryPoints: 1,

      behavior: {
        production: {megacredits: 1},
      },

      metadata: {
        cardNumber: 'I43',
        renderData: CardRenderer.builder((b) => {
          b.action('Spend X M€ and X steel to gain X titanium.', (eb) => {
            eb.text('x').megacredits(1).text('x').steel(1).startAction.text('x').titanium(1);
          }).br;
          b.production((pb) => pb.megacredits(1));
        }),
        description: 'Requires 8% Venus.',
      },
    });
  }

  private max(player: IPlayer) {
    return Math.min(player.megaCredits, player.steel);
  }

  public canAct(player: IPlayer) {
    return this.max(player) > 0;
  }

  public action(player: IPlayer) {
    return new SelectAmount('Select how much M€ and steel to convert into titanium', 'Convert', 1, this.max(player), true)
      .andThen((amount) => {
        player.stock.deduct(Resource.MEGACREDITS, amount);
        player.stock.deduct(Resource.STEEL, amount);
        player.stock.add(Resource.TITANIUM, amount, {log: true, from: {card: this}});
        return undefined;
      });
  }
}
