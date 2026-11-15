import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {InfrastructureCard} from './InfrastructureCard';

/**
 * Epic: Effect: when you spend or assign an agent, gain 1 M€.
 * TODO(Leo): agents are not in the game, so this card is never dealt (HighOrbit's COMPATIBILITY).
 */
export class Spysat extends InfrastructureCard {
  constructor(copy: number = 1) {
    super(CardName.SPYSAT, copy, {
      metadata: {
        cardNumber: 'INF05',
        renderData: CardRenderer.builder((b) => {
          b.effect('When you spend or assign an agent, gain 1 M€.', (eb) => eb.text('agent').startEffect.megacredits(1));
        }),
      },
    });
  }
}
