import {IProjectCard} from '../IProjectCard';
import {ActionCard} from '../ActionCard';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardResource} from '../../../common/CardResource';
import {CardRenderer} from '../render/CardRenderer';

export class VenusianInfrastructures extends ActionCard implements IProjectCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.VENUSIAN_INFRASTRUCTURES,
      tags: [Tag.VENUS],
      cost: 11,
      resourceType: CardResource.FLOATER,
      requirements: {venus: 12},
      victoryPoints: {resourcesHere: {}, per: 2},

      action: {
        spend: {resourceFromAnyCard: {type: CardResource.ORE}},
        addResources: 2,
      },

      metadata: {
        cardNumber: 'V53',
        renderData: CardRenderer.builder((b) => {
          b.action('Spend 1 ore from any of your cards to add 2 floaters to this card.', (eb) => {
            eb.resource(CardResource.ORE).asterix().startAction.resource(CardResource.FLOATER, 2);
          }).br;
          b.vpText('1 VP for every 2 floaters on this card.');
        }),
        description: 'Requires 12% Venus.',
      },
    });
  }
}
