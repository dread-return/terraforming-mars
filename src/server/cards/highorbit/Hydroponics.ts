import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {InfrastructureActionCard} from './InfrastructureCard';

export class Hydroponics extends InfrastructureActionCard {
  constructor(copy: number = 1) {
    super(CardName.HYDROPONICS, copy, {
      tags: [Tag.PLANT],
      cardDiscount: {tag: Tag.PLANT, amount: 1},
      action: {
        spend: {energy: 1},
        stock: {plants: 2},
      },
      metadata: {
        cardNumber: 'INF16',
        renderData: CardRenderer.builder((b) => {
          b.action('Spend 1 energy to gain 2 plants.', (eb) => eb.energy(1).startAction.plants(2)).br;
          b.effect('When you play a card with a plant tag, you pay 1 M€ less.', (eb) => eb.tag(Tag.PLANT).startEffect.megacredits(-1));
        }),
      },
    });
  }
}
