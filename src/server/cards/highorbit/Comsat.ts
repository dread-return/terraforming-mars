import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {InfrastructureCard} from './InfrastructureCard';

/** The trade bonus is paid by HighOrbit.onTrade, once per Comsat owned. */
export class Comsat extends InfrastructureCard {
  constructor(copy: number = 1) {
    super(CardName.COMSAT, copy, {
      metadata: {
        cardNumber: 'INF01',
        renderData: CardRenderer.builder((b) => {
          b.effect('Every time you perform a trade action, gain 1 M€.', (eb) => eb.trade().startEffect.megacredits(1));
        }),
      },
    });
  }
}
