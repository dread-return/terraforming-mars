import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {InfrastructureActionCard} from './InfrastructureCard';

export class SpaceHabitat extends InfrastructureActionCard {
  constructor(copy: number = 1) {
    super(CardName.SPACE_HABITAT, copy, {
      action: {
        spend: {titanium: 1},
        production: {megacredits: 1},
      },
      metadata: {
        cardNumber: 'HO54',
        renderData: CardRenderer.builder((b) => {
          b.action('Spend 1 titanium to increase your M€ production 1 step.', (eb) => eb.titanium(1).startAction.production((pb) => pb.megacredits(1)));
        }),
      },
    });
  }
}
