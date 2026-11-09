import {IProjectCard} from '../IProjectCard';
import {ActionCard} from '../ActionCard';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardResource} from '../../../common/CardResource';
import {CardRenderer} from '../render/CardRenderer';

export class VenusAircraftHaven extends ActionCard implements IProjectCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.VENUS_AIRCRAFT_HAVEN,
      tags: [Tag.VENUS, Tag.BUILDING],
      cost: 13,
      resourceType: CardResource.FLOATER,
      requirements: {venus: 6},
      victoryPoints: {resourcesHere: {}, per: 3},

      behavior: {
        addResources: 2,
      },

      action: {
        or: {
          behaviors: [
            {
              title: 'Remove 3 floaters here to raise Venus 1 step',
              spend: {resourcesHere: 3},
              global: {venus: 1},
            },
            {
              title: 'Add 1 floater to this card',
              addResources: 1,
            },
          ],
        },
      },

      metadata: {
        cardNumber: 'V77',
        renderData: CardRenderer.builder((b) => {
          b.action(undefined, (eb) => {
            eb.empty().startAction.resource(CardResource.FLOATER);
          }).br;
          b.or().br;
          b.action('Add 1 floater here, OR remove 3 to raise Venus 1 step.', (eb) => {
            eb.resource(CardResource.FLOATER, 3).startAction.venus(1);
          });
        }),
        description: 'Add 2 floaters here.',
      },
    });
  }
}
