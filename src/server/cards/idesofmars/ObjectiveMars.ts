import {IProjectCard} from '../IProjectCard';
import {ActionCard} from '../ActionCard';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {CardResource} from '../../../common/CardResource';
import {CardRenderer} from '../render/CardRenderer';

export class ObjectiveMars extends ActionCard implements IProjectCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.OBJECTIVE_MARS,
      cost: 3,
      resourceType: CardResource.BUDGET,
      victoryPoints: {resourcesHere: {}},

      behavior: {
        production: {megacredits: -5},
      },

      action: {
        addResources: 1,
      },

      metadata: {
        cardNumber: 'I66',
        renderData: CardRenderer.builder((b) => {
          b.action('Add a budget to this card.', (eb) => {
            eb.empty().startAction.resource(CardResource.BUDGET);
          }).br;
          b.production((pb) => pb.megacredits(-5));
        }),
        description: 'Decrease your M€ production 5 steps. 1 VP per budget here.',
      },
    });
  }
}
