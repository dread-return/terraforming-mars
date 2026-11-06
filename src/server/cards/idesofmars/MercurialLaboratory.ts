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

export class MercurialLaboratory extends Card implements IProjectCard, IActionCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.MERCURIAL_LABORATORY,
      tags: [Tag.POWER, Tag.MERCURY, Tag.SPACE],
      cost: 8,
      victoryPoints: 1,

      behavior: {
        production: {energy: -1},
      },

      metadata: {
        cardNumber: 'I54',
        renderData: CardRenderer.builder((b) => {
          b.action('Spend X M€ and X titanium to gain X steel and X energy.', (eb) => {
            eb.text('x').megacredits(1).text('x').titanium(1).startAction.text('x').steel(1).text('x').energy(1);
          }).br;
          b.production((pb) => pb.minus().energy(1));
        }),
        description: 'Decrease your energy production 1 step.',
      },
    });
  }

  private max(player: IPlayer) {
    return Math.min(player.megaCredits, player.titanium);
  }

  public canAct(player: IPlayer) {
    return this.max(player) > 0;
  }

  public action(player: IPlayer) {
    return new SelectAmount('Select how much M€ and titanium to convert into steel and energy', 'Convert', 1, this.max(player), true)
      .andThen((amount) => {
        player.stock.deduct(Resource.MEGACREDITS, amount);
        player.stock.deduct(Resource.TITANIUM, amount);
        player.stock.add(Resource.STEEL, amount, {log: true, from: {card: this}});
        player.stock.add(Resource.ENERGY, amount, {log: true, from: {card: this}});
        return undefined;
      });
  }
}
