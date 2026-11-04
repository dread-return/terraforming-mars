import {IProjectCard} from '../IProjectCard';
import {ActionCard} from '../ActionCard';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardResource} from '../../../common/CardResource';
import {CardRenderer} from '../render/CardRenderer';

export class VenusianFluctuatingPlants extends ActionCard implements IProjectCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.VENUSIAN_FLUCTUATING_PLANTS,
      tags: [Tag.VENUS, Tag.PLANT],
      cost: 19,
      requirements: {venus: 6},
      resourceType: CardResource.FLOATER,
      victoryPoints: {resourcesHere: {}, per: 2},

      action: {
        or: {
          behaviors: [
            {
              title: 'Add 1 floater to any card',
              addResourcesToAnyCard: {type: CardResource.FLOATER, count: 1},
            },
            {
              title: 'Spend 3 plants to add 2 floaters to any card',
              spend: {plants: 3},
              addResourcesToAnyCard: {type: CardResource.FLOATER, count: 2},
            },
          ],
        },
      },

      metadata: {
        cardNumber: 'B43',
        renderData: CardRenderer.builder((b) => {
          b.action('Add 1 floater to ANY card.', (eb) => {
            eb.empty().startAction.resource(CardResource.FLOATER).asterix();
          }).br;
          b.or().br;
          b.action('Spend 3 plants to add 2 floaters to ANY card.', (eb) => {
            eb.plants(3).startAction.resource(CardResource.FLOATER, 2).asterix();
          }).br;
          b.vpText('1 VP per 2 floaters on this card.');
        }),
        description: 'Requires 6% Venus.',
      },
    });
  }
}
