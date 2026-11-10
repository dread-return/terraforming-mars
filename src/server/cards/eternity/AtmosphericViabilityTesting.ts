import {ActionCard} from '../ActionCard';
import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {CardResource} from '../../../common/CardResource';
import {CardType} from '../../../common/cards/CardType';
import {IProjectCard} from '../IProjectCard';
import {Tag} from '../../../common/cards/Tag';

export class AtmosphericViabilityTesting extends ActionCard implements IProjectCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.ATMOSPHERIC_VIABILITY_TESTING,
      tags: [Tag.ANIMAL, Tag.VENUS],
      cost: 9,
      resourceType: CardResource.ANIMAL,
      requirements: {venus: 8},
      behavior: {
        addResources: 1,
      },
      action: {
        spend: {resourceFromAnyCard: {type: CardResource.ANIMAL}},
        global: {venus: 1},
      },
      metadata: {
        cardNumber: 'E04',
        renderData: CardRenderer.builder((b) => {
          b.action('Remove 1 animal from any of your cards to raise Venus 1 step.', (eb) => eb.resource(CardResource.ANIMAL).asterix().startAction.venus(1)).br;
          b.resource(CardResource.ANIMAL);
        }),
        description: 'Requires 8% Venus. Add 1 animal here.',
      },
    });
  }
}
