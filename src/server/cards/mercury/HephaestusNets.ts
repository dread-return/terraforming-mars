import {CardName} from '../../../common/cards/CardName';
import {CardType} from '../../../common/cards/CardType';
import {Tag} from '../../../common/cards/Tag';
import {CardResource} from '../../../common/CardResource';
import {Resource} from '../../../common/Resource';
import {CardRenderer} from '../render/CardRenderer';
import {Card} from '../Card';
import {IProjectCard} from '../IProjectCard';
import {IActionCard} from '../ICard';
import {IPlayer} from '../../IPlayer';
import {SelectAmount} from '../../inputs/SelectAmount';

export class HephaestusNets extends Card implements IProjectCard, IActionCard {
  constructor() {
    super({
      name: CardName.HEPHAESTUS_NETS,
      type: CardType.ACTIVE,
      tags: [Tag.MERCURY],
      cost: 12,
      resourceType: CardResource.ASTEROID,
      behavior: {
        production: {steel: 1},
      },
      metadata: {
        cardNumber: 'MM10',
        renderData: CardRenderer.builder((b) => {
          b.action('Spend 2X steel to add X asteroids here.', (ab) => {
            ab.text('2X').steel(1).startAction.text('X').resource(CardResource.ASTEROID);
          }).br;
          b.effect('You can use asteroids here as 6 M€ each to pay for cards with a Mars or Venus tag, or for a trade.', (eb) => {
            eb.resource(CardResource.ASTEROID).startEffect.megacredits(6).slash().tag(Tag.MARS).slash().tag(Tag.VENUS).slash().trade();
          }).br;
          b.production((pb) => pb.steel(1));
        }),
        description: 'Increase your steel production 1 step.',
      },
    });
  }

  public canAct(player: IPlayer) {
    return player.steel >= 2;
  }

  public action(player: IPlayer) {
    const max = Math.floor(player.steel / 2);
    return new SelectAmount('Add how many asteroids? (2 steel each)', 'Add', 1, max, true).andThen((amount) => {
      player.stock.deduct(Resource.STEEL, amount * 2, {log: true});
      player.addResourceTo(this, {qty: amount, log: true});
      return undefined;
    });
  }
}
