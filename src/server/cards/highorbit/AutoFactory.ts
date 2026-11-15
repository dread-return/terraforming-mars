import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardResource} from '../../../common/CardResource';
import {Resource} from '../../../common/Resource';
import {CardRenderer} from '../render/CardRenderer';
import {digit} from '../Options';
import {IOreConverter, InfrastructureActionCard, OreConversion} from './InfrastructureCard';

export class AutoFactory extends InfrastructureActionCard implements IOreConverter {
  public readonly oreConversions: ReadonlyArray<OreConversion> = [
    {title: '2 ore → 1 titanium', ore: 2, apply: (player, times) => player.stock.add(Resource.TITANIUM, times, {log: true})},
    {title: '2 ore → 2 steel', ore: 2, apply: (player, times) => player.stock.add(Resource.STEEL, 2 * times, {log: true})},
  ];

  constructor(copy: number = 1) {
    super(CardName.AUTO_FACTORY, copy, {
      tags: [Tag.BUILDING],
      resourceType: CardResource.ORE,
      action: {
        spend: {heat: 1},
        addResourcesToAnyCard: {type: CardResource.ORE, count: 2},
      },
      metadata: {
        cardNumber: 'INF09',
        renderData: CardRenderer.builder((b) => {
          b.action('Spend 1 heat to add 2 ore to any card.', (eb) => eb.heat(1).startAction.resource(CardResource.ORE, {amount: 2, digit}).asterix()).br;
          b.effect('Free action, any number of times: turn 2 ore here into 1 titanium or 2 steel.', (eb) => {
            eb.resource(CardResource.ORE, {amount: 2, digit}).startEffect.titanium(1).slash().steel(2, {digit});
          });
        }),
      },
    });
  }
}
