import {IProjectCard} from '../IProjectCard';
import {ActionCard} from '../ActionCard';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardResource} from '../../../common/CardResource';
import {CardRenderer} from '../render/CardRenderer';

export class EnvironmentContamination extends ActionCard implements IProjectCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.ENVIRONMENT_CONTAMINATION,
      tags: [Tag.RADIOACTIVE],
      cost: 3,
      resourceType: CardResource.RADIATION,
      // VP badge 1/4 (card text says 1/3). Following the icon.
      victoryPoints: {resourcesHere: {}, per: 4},

      action: {
        // The icon shows 2 radiation; the card text says 1. Following the icon.
        spend: {plants: 1},
        addResourcesToAnyCard: {type: CardResource.RADIATION, count: 2},
      },

      metadata: {
        cardNumber: 'N17',
        renderData: CardRenderer.builder((b) => {
          b.action('Spend 1 plant to add 2 radiation to ANY card.', (eb) => {
            eb.plants(1).startAction.resource(CardResource.RADIATION, 2).asterix();
          }).br;
          b.vpText('1 VP for every 4 radiation on this card.');
        }),
      },
    });
  }
}
