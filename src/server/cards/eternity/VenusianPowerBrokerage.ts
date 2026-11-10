import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {CardResource} from '../../../common/CardResource';
import {CardType} from '../../../common/cards/CardType';
import {Card} from '../Card';
import {IPlayer} from '../../IPlayer';
import {IProjectCard} from '../IProjectCard';
import {OrOptions} from '../../inputs/OrOptions';
import {Resource} from '../../../common/Resource';
import {SelectAmount} from '../../inputs/SelectAmount';
import {SelectOption} from '../../inputs/SelectOption';
import {Tag} from '../../../common/cards/Tag';

export class VenusianPowerBrokerage extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.VENUSIAN_POWER_BROKERAGE,
      tags: [Tag.POWER, Tag.VENUS],
      cost: 20,
      resourceType: CardResource.FLOATER,
      requirements: {venus: 4},
      victoryPoints: 2,
      behavior: {
        addResources: 2,
      },
      metadata: {
        cardNumber: 'E38',
        renderData: CardRenderer.builder((b) => {
          b.action('Spend X energy to add X floaters here.', (eb) => eb.text('X').energy(1).startAction.text('X').resource(CardResource.FLOATER)).br;
          b.or().br;
          b.action('Remove 2 floaters here to increase any production 1 step.', (eb) => eb.resource(CardResource.FLOATER, 2).startAction.production((pb) => pb.wild(1))).br;
          b.resource(CardResource.FLOATER, 2);
        }),
        description: 'Requires 4% Venus. Add 2 floaters here.',
      },
    });
  }

  public canAct(player: IPlayer) {
    return player.energy > 0 || this.resourceCount >= 2;
  }
  public action(player: IPlayer) {
    const options = [];
    if (player.energy > 0) {
      options.push(new SelectOption('Spend energy to add floaters here').andThen(() => new SelectAmount('Energy to spend', 'Spend', 1, player.energy).andThen((n) => {
        player.stock.deduct(Resource.ENERGY, n);
        player.addResourceTo(this, {qty: n, log: true});
        return undefined;
      })));
    }
    if (this.resourceCount >= 2) {
      options.push(new OrOptions(
        ...[Resource.MEGACREDITS, Resource.STEEL, Resource.TITANIUM, Resource.PLANTS, Resource.ENERGY, Resource.HEAT].map((r) =>
          new SelectOption(r).andThen(() => {
            player.removeResourceFrom(this, 2);
            player.production.add(r, 1, {log: true});
            return undefined;
          }))).setTitle('Remove 2 floaters here to increase a production 1 step'));
    }
    return options.length === 1 ? options[0] : new OrOptions(...options);
  }
}
