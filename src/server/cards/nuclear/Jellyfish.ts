import {IProjectCard} from '../IProjectCard';
import {ActionCard} from '../ActionCard';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardResource} from '../../../common/CardResource';
import {CardRenderer} from '../render/CardRenderer';

export class Jellyfish extends ActionCard implements IProjectCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.JELLYFISH,
      tags: [Tag.ANIMAL],
      cost: 7,
      requirements: {oceans: 5},
      resourceType: CardResource.ANIMAL,
      victoryPoints: {resourcesHere: {}, per: 2},
      behavior: {addResources: {oceans: {}, per: 2}},

      action: {addResources: 1},

      metadata: {
        cardNumber: 'N08',
        renderData: CardRenderer.builder((b) => {
          b.action('Add an animal to this card.', (eb) => {
            eb.empty().startAction.resource(CardResource.ANIMAL);
          }).br;
          b.resource(CardResource.ANIMAL).slash().oceans(2);
        }),
        description: 'Requires 5 oceans in play. Add an animal to this card for every 2 oceans in play. 1 VP for every 2 animals on this card.',
      },
    });
  }
}
