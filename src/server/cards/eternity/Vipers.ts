import {ActionCard} from '../ActionCard';
import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {CardResource} from '../../../common/CardResource';
import {CardType} from '../../../common/cards/CardType';
import {IProjectCard} from '../IProjectCard';
import {Tag} from '../../../common/cards/Tag';

export class Vipers extends ActionCard implements IProjectCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.VIPERS,
      tags: [Tag.ANIMAL, Tag.PLANT],
      cost: 7,
      resourceType: CardResource.ANIMAL,
      requirements: {temperature: -2},
      victoryPoints: {resourcesHere: {}, per: 3},
      action: {
        addResources: {tag: Tag.PLANT, per: 2},
      },
      metadata: {
        cardNumber: 'E138',
        renderData: CardRenderer.builder((b) => {
          b.action('Add an animal here for every 2 plant tags you have.', (eb) => eb.empty().startAction.resource(CardResource.ANIMAL).slash().tag(Tag.PLANT, 2));
        }),
        description: 'Requires -2 \u00b0C or warmer. 1 VP per 3 animals here.',
      },
    });
  }
}
