import {IProjectCard} from '../IProjectCard';
import {ActionCard} from '../ActionCard';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardResource} from '../../../common/CardResource';
import {CardRenderer} from '../render/CardRenderer';

export class SlowGrowthPlantation extends ActionCard implements IProjectCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.SLOW_GROWTH_PLANTATION,
      tags: [Tag.MICROBE],
      cost: 12,
      requirements: {oxygen: 4},
      resourceType: CardResource.MICROBE,

      behavior: {
        addResources: 3,
      },

      action: {
        or: {
          behaviors: [
            {
              title: 'Add 1 microbe to this card',
              addResources: 1,
            },
            {
              title: 'Remove 5 microbes from this card to place a greenery tile',
              spend: {resourcesHere: 5},
              greenery: {},
            },
          ],
        },
      },

      metadata: {
        cardNumber: 'B04',
        renderData: CardRenderer.builder((b) => {
          b.action('Add 1 microbe to this card.', (eb) => {
            eb.empty().startAction.resource(CardResource.MICROBE);
          }).br;
          b.or().br;
          b.action('Remove 5 microbes from this card to place a greenery tile.', (eb) => {
            eb.resource(CardResource.MICROBE, 5).startAction.greenery();
          }).br;
          b.resource(CardResource.MICROBE, 3);
        }),
        description: 'Requires 4% oxygen. Add 3 microbes to this card.',
      },
    });
  }
}
