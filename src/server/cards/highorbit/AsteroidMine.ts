import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardResource} from '../../../common/CardResource';
import {Resource} from '../../../common/Resource';
import {CardRenderer} from '../render/CardRenderer';
import {digit} from '../Options';
import {IOreConverter, InfrastructureActionCard, OreConversion} from './InfrastructureCard';

export class AsteroidMine extends InfrastructureActionCard implements IOreConverter {
  public readonly oreConversions: ReadonlyArray<OreConversion> = [{
    title: '2 ore → 1 energy and 1 heat',
    ore: 2,
    apply: (player, times) => {
      player.stock.add(Resource.ENERGY, times, {log: true});
      player.stock.add(Resource.HEAT, times, {log: true});
    },
  }];

  constructor(copy: number = 1) {
    super(CardName.ASTEROID_MINE, copy, {
      tags: [Tag.BUILDING],
      resourceType: CardResource.ORE,
      action: {
        addResourcesToAnyCard: {type: CardResource.ORE, count: 2},
      },
      metadata: {
        cardNumber: 'INF08',
        renderData: CardRenderer.builder((b) => {
          b.action('Add 2 ore to any card.', (eb) => eb.empty().startAction.resource(CardResource.ORE, {amount: 2, digit}).asterix()).br;
          b.effect('Free action, any number of times: turn 2 ore here into 1 energy and 1 heat.', (eb) => {
            eb.resource(CardResource.ORE, {amount: 2, digit}).startEffect.energy(1).heat(1);
          });
        }),
      },
    });
  }
}
