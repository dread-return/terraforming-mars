import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {InfrastructureCard} from './InfrastructureCard';

export class NavigationalBeacon extends InfrastructureCard {
  constructor(copy: number = 1) {
    super(CardName.NAVIGATIONAL_BEACON, copy, {
      cardDiscount: {tag: Tag.SPACE, amount: 1, per: 'tag'},
      metadata: {
        cardNumber: 'INF03',
        renderData: CardRenderer.builder((b) => {
          b.effect('When you play a space tag, you pay 1 M€ less.', (eb) => eb.tag(Tag.SPACE).startEffect.megacredits(-1));
        }),
      },
    });
  }
}
