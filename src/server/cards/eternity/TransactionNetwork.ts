import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {CardResource} from '../../../common/CardResource';
import {CardType} from '../../../common/cards/CardType';
import {Card} from '../Card';
import {IPlayer} from '../../IPlayer';
import {IProjectCard} from '../IProjectCard';
import {Resource} from '../../../common/Resource';
import {SelectAmount} from '../../inputs/SelectAmount';
import {Tag} from '../../../common/cards/Tag';
import {all} from '../Options';
import {questionmark} from '../render/DynamicVictoryPoints';

export class TransactionNetwork extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.TRANSACTION_NETWORK,
      tags: [Tag.MARS, Tag.EARTH, Tag.VENUS],
      cost: 2,
      resourceType: CardResource.FLOATER,
      requirements: [{tag: Tag.MARS}, {tag: Tag.EARTH}, {tag: Tag.VENUS}],
      victoryPoints: 'special',
      metadata: {
        cardNumber: 'E133',
        victoryPoints: questionmark(),
        renderData: CardRenderer.builder((b) => {
          b.effect('Anyone discards from hand: 1 floater here.', (eb) => eb.minus().cards(1, {all}).startEffect.resource(CardResource.FLOATER)).br;
          b.action('Remove X floaters: 1 M€ per 4.', (eb) => eb.text('X').resource(CardResource.FLOATER).startAction.megacredits(0, {text: 'x/4'})).br;
          b.vpText('2 VP if 20+ floaters here.');
        }),
        description: 'Requires a Mars, an Earth and a Venus tag.',
      },
    });
  }

  public override getVictoryPoints() {
    return this.resourceCount >= 20 ? 2 : 0;
  }
  public canAct() {
    return this.resourceCount >= 4;
  }
  public action(player: IPlayer) {
    return new SelectAmount('Floaters to remove (1 M€ per 4)', 'Remove', 4, this.resourceCount).andThen((n) => {
      player.removeResourceFrom(this, n);
      player.stock.add(Resource.MEGACREDITS, Math.floor(n / 4), {log: true});
      return undefined;
    });
  }
}
