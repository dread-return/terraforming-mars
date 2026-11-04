import {IProjectCard} from '../IProjectCard';
import {ActionCard} from '../ActionCard';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardResource} from '../../../common/CardResource';
import {CardRenderer} from '../render/CardRenderer';

export class MicrobeColtures extends ActionCard implements IProjectCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.MICROBE_COLTURES,
      tags: [Tag.MICROBE],
      cost: 4,
      requirements: {tag: Tag.SCIENCE, count: 2},
      resourceType: CardResource.MICROBE,
      victoryPoints: {resourcesHere: {}, per: 3},

      action: {
        or: {
          behaviors: [
            {
              title: 'Spend 1 heat to add 1 microbe to any card',
              spend: {heat: 1},
              addResourcesToAnyCard: {type: CardResource.MICROBE, count: 1},
            },
            {
              title: 'Spend 5 heat to add 2 microbes to any card',
              spend: {heat: 5},
              addResourcesToAnyCard: {type: CardResource.MICROBE, count: 2},
            },
          ],
        },
      },

      metadata: {
        cardNumber: 'B25',
        renderData: CardRenderer.builder((b) => {
          b.action('Spend 1 heat to add 1 microbe to ANY card.', (eb) => {
            eb.heat(1).startAction.resource(CardResource.MICROBE).asterix();
          }).br;
          b.or().br;
          b.action('Spend 5 heat to add 2 microbes to ANY card.', (eb) => {
            eb.heat(5).startAction.resource(CardResource.MICROBE, 2).asterix();
          }).br;
          b.vpText('1 VP per 3 microbes on this card.');
        }),
        description: 'Requires 2 science tags.',
      },
    });
  }
}
