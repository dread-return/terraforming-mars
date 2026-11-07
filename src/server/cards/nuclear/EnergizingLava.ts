import {IProjectCard} from '../IProjectCard';
import {ActionCard} from '../ActionCard';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardResource} from '../../../common/CardResource';
import {CardRenderer} from '../render/CardRenderer';
import {max} from '../Options';

export class EnergizingLava extends ActionCard implements IProjectCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.ENERGIZING_LAVA,
      tags: [Tag.RADIOACTIVE],
      cost: 4,
      requirements: {tag: Tag.RADIOACTIVE, count: 4, max},
      resourceType: CardResource.RADIATION,
      victoryPoints: {resourcesHere: {}, per: 4},

      action: {
        spend: {heat: 1},
        addResourcesToAnyCard: {type: CardResource.RADIATION, count: 1},
      },

      metadata: {
        cardNumber: 'N61',
        renderData: CardRenderer.builder((b) => {
          b.action('Spend 1 heat to add a radiation to ANY card.', (eb) => {
            eb.heat(1).startAction.resource(CardResource.RADIATION).asterix();
          });
        }),
        description: 'Requires that you have at most 4 radioactive tags. 1 VP for every 4 radiation on this card.',
      },
    });
  }
}
