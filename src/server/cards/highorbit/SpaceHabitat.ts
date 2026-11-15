import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {InfrastructureActionCard} from './InfrastructureCard';

export class SpaceHabitat extends InfrastructureActionCard {
  constructor(copy: number = 1) {
    super(CardName.SPACE_HABITAT, copy, {
      tags: [Tag.CITY],
      victoryPoints: 1,
      action: {
        spend: {titanium: 1},
        production: {megacredits: 1},
        stock: {megacredits: 1},
      },
      metadata: {
        cardNumber: 'INF21',
        renderData: CardRenderer.builder((b) => {
          b.action('Spend 1 titanium to increase your M€ production 1 step and gain 1 M€.', (eb) => {
            eb.titanium(1).startAction.production((pb) => pb.megacredits(1)).megacredits(1);
          });
        }),
      },
    });
  }
}
