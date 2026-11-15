import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {InfrastructureActionCard} from './InfrastructureCard';

export class Hydroponics extends InfrastructureActionCard {
  constructor(copy: number = 1) {
    super(CardName.HYDROPONICS, copy, {
      action: {
        spend: {energy: 1},
        stock: {plants: 2},
      },
      metadata: {
        cardNumber: 'HO40',
        renderData: CardRenderer.builder((b) => {
          b.action('Spend 1 energy to gain 2 plants.', (eb) => eb.energy(1).startAction.plants(2));
        }),
      },
    });
  }
}
