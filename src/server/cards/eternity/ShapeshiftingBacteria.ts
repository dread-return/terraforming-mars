import {ActionCard} from '../ActionCard';
import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {CardResource} from '../../../common/CardResource';
import {CardType} from '../../../common/cards/CardType';
import {IProjectCard} from '../IProjectCard';
import {Tag} from '../../../common/cards/Tag';

export class ShapeshiftingBacteria extends ActionCard implements IProjectCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.SHAPESHIFTING_BACTERIA,
      tags: [Tag.MICROBE, Tag.SPACE],
      cost: 3,
      resourceType: CardResource.MICROBE,
      requirements: [{tag: Tag.MICROBE, count: 2}, {tag: Tag.SPACE}],
      victoryPoints: {resourcesHere: {}, per: 3},
      action: {
        or: {
          behaviors: [
            {title: 'Add 1 microbe here', addResources: 1},
            {title: 'Remove 3 microbes here to gain 2 titanium', spend: {resourcesHere: 3}, stock: {titanium: 2}},
          ],
        },
      },
      metadata: {
        cardNumber: 'E116',
        renderData: CardRenderer.builder((b) => {
          b.action('Add a microbe to this card.', (eb) => eb.empty().startAction.resource(CardResource.MICROBE)).br;
          b.or().br;
          b.action('Remove 3 microbes to gain 2 titanium.', (eb) => eb.resource(CardResource.MICROBE, 3).startAction.titanium(2));
        }),
        description: 'Requires 2 microbe tags and a space tag. 1 VP per 3 microbes here.',
      },
    });
  }
}
