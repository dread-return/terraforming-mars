import {IProjectCard} from '../IProjectCard';
import {ActionCard} from '../ActionCard';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardResource} from '../../../common/CardResource';
import {CardRenderer} from '../render/CardRenderer';

export class VenusianHeatExchangers extends ActionCard implements IProjectCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.VENUSIAN_HEAT_EXCHANGERS,
      tags: [Tag.VENUS],
      cost: 12,
      requirements: {venus: 14},

      action: {
        or: {
          behaviors: [
            {
              title: 'Decrease your heat production 2 steps to raise your TR 1 step',
              production: {heat: -2},
              tr: 1,
            },
            {
              title: 'Remove 2 floaters from one of your cards to increase your heat production 2 steps',
              removeResourcesFromAnyCard: {type: CardResource.FLOATER, count: 2, source: 'self'},
              production: {heat: 2},
            },
          ],
        },
      },

      metadata: {
        cardNumber: 'B40',
        renderData: CardRenderer.builder((b) => {
          b.action('Decrease your heat production 2 steps to raise your TR 1 step.', (eb) => {
            eb.production((pb) => pb.heat(2)).startAction.tr(1);
          }).br;
          b.or().br;
          b.action('Remove 2 floaters from one of your cards to increase your heat production 2 steps.', (eb) => {
            eb.resource(CardResource.FLOATER, 2).asterix().startAction.production((pb) => pb.heat(2));
          });
        }),
        description: 'Requires 14% Venus.',
      },
    });
  }
}
