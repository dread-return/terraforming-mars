import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {InfrastructureCard} from './InfrastructureCard';

/**
 * Epic version: 1 M€ for each step of temperature or oxygen you raise, and for each ocean you place.
 * Paid by HighOrbit.onGlobalParameterIncrease.
 */
export class WeatherSatellite extends InfrastructureCard {
  constructor(copy: number = 1) {
    super(CardName.WEATHER_SATELLITE, copy, {
      metadata: {
        cardNumber: 'HO36',
        renderData: CardRenderer.builder((b) => {
          b.effect('Whenever you raise the temperature or oxygen 1 step, or place an ocean, gain 1 M€.', (eb) => {
            eb.temperature(1).slash().oxygen(1).slash().oceans(1).startEffect.megacredits(1);
          });
        }),
      },
    });
  }
}
