import {CardName} from '../../../common/cards/CardName';
import {CardResource} from '../../../common/CardResource';
import {Resource} from '../../../common/Resource';
import {CardRenderer} from '../render/CardRenderer';
import {digit} from '../Options';
import {IOreConverter, InfrastructureActionCard, OreConversion} from './InfrastructureCard';

export class SpaceTradingStation extends InfrastructureActionCard implements IOreConverter {
  public readonly oreConversions: ReadonlyArray<OreConversion> = [
    {title: '3 ore → 5 M€', ore: 3, apply: (player, times) => player.stock.add(Resource.MEGACREDITS, 5 * times, {log: true})},
  ];

  constructor(copy: number = 1) {
    super(CardName.SPACE_TRADING_STATION, copy, {
      resourceType: CardResource.ORE,
      action: {
        spend: {megacredits: 1},
        addResourcesToAnyCard: {type: CardResource.ORE, count: 2},
      },
      metadata: {
        cardNumber: 'INF14',
        renderData: CardRenderer.builder((b) => {
          b.action('Spend 1 M€ to add 2 ore to any card.', (eb) => eb.megacredits(1).startAction.resource(CardResource.ORE, {amount: 2, digit}).asterix()).br;
          b.effect('Free action, any number of times: turn 3 ore here into 5 M€.', (eb) => {
            eb.resource(CardResource.ORE, {amount: 3, digit}).startEffect.megacredits(5);
          });
        }),
      },
    });
  }
}
