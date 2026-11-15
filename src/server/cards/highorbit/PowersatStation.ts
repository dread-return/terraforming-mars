import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {InfrastructureActionCard} from './InfrastructureCard';

export class PowersatStation extends InfrastructureActionCard {
  constructor(copy: number = 1) {
    super(CardName.POWERSAT_STATION, copy, {
      tags: [Tag.POWER],
      action: {
        spend: {titanium: 1},
        production: {energy: 1},
        stock: {energy: 1},
      },
      metadata: {
        cardNumber: 'INF19',
        renderData: CardRenderer.builder((b) => {
          b.action('Spend 1 titanium to increase your energy production 1 step and gain 1 energy.', (eb) => {
            eb.titanium(1).startAction.production((pb) => pb.energy(1)).energy(1);
          });
        }),
      },
    });
  }
}
