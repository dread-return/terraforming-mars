import {ActionCard} from '../ActionCard';
import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {CardResource} from '../../../common/CardResource';
import {CardType} from '../../../common/cards/CardType';
import {IProjectCard} from '../IProjectCard';
import {Tag} from '../../../common/cards/Tag';

export class Actinobacteria extends ActionCard implements IProjectCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.ACTINOBACTERIA,
      tags: [Tag.MICROBE],
      cost: 14,
      resourceType: CardResource.MICROBE,
      requirements: [{temperature: -2}, {tag: Tag.MICROBE, count: 2}],
      victoryPoints: {resourcesHere: {}, per: 8},
      action: {
        addResources: {greeneries: {}, all: true},
      },
      metadata: {
        cardNumber: 'E00',
        renderData: CardRenderer.builder((b) => {
          b.action('Add 1 microbe here for every greenery tile in play.', (eb) => {
            eb.empty().startAction.resource(CardResource.MICROBE).slash().greenery({withO2: false}).asterix();
          });
        }),
        description: 'Requires -2 \u00b0C or warmer and 2 microbe tags. 1 VP per 8 microbes here.',
      },
    });
  }
}
