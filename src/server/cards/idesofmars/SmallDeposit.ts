import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {IActionCard} from '../ICard';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardResource} from '../../../common/CardResource';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {OrOptions} from '../../inputs/OrOptions';
import {SelectOption} from '../../inputs/SelectOption';
import {Resource} from '../../../common/Resource';
import {digit} from '../Options';

export class SmallDeposit extends Card implements IProjectCard, IActionCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.SMALL_DEPOSIT,
      tags: [Tag.BUILDING],
      cost: 4,
      resourceType: CardResource.ORE,

      behavior: {
        addResources: 6,
      },

      metadata: {
        cardNumber: 'I19',
        renderData: CardRenderer.builder((b) => {
          b.action('Spend 2 ore from this card to gain 2 steel or 2 titanium.', (eb) => {
            eb.resource(CardResource.ORE, {amount: 2, digit}).startAction.steel(2, {digit}).slash().titanium(2, {digit});
          }).br;
          b.resource(CardResource.ORE, {amount: 6, digit});
        }),
        description: 'Add 6 ore to this card.',
      },
    });
  }

  public canAct() {
    return this.resourceCount >= 2;
  }

  private spend(player: IPlayer, resource: Resource) {
    player.removeResourceFrom(this, 2, {log: false});
    player.stock.add(resource, 2, {log: true, from: {card: this}});
    return undefined;
  }

  public action(player: IPlayer) {
    return new OrOptions(
      new SelectOption('Spend 2 ore to gain 2 steel').andThen(() => this.spend(player, Resource.STEEL)),
      new SelectOption('Spend 2 ore to gain 2 titanium').andThen(() => this.spend(player, Resource.TITANIUM)),
    );
  }
}
