import {IProjectCard} from '../IProjectCard';
import {ActionCard} from '../ActionCard';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardResource} from '../../../common/CardResource';
import {CardRenderer} from '../render/CardRenderer';

export class SolarWindTrap extends ActionCard implements IProjectCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.SOLAR_WIND_TRAP,
      tags: [Tag.SPACE],
      cost: 13,
      resourceType: CardResource.ORE,

      action: {
        or: {
          behaviors: [
            {
              title: 'Remove 3 ore here to raise Venus 1 step',
              spend: {resourcesHere: 3},
              global: {venus: 1},
            },
            {
              title: 'Add 2 ore to this card',
              addResources: 2,
            },
          ],
        },
      },

      metadata: {
        cardNumber: 'V52',
        renderData: CardRenderer.builder((b) => {
          b.action('Add 2 ore to this card.', (eb) => {
            eb.empty().startAction.resource(CardResource.ORE, 2);
          }).br;
          b.or().br;
          b.action('Remove 3 ore here to raise Venus 1 step.', (eb) => {
            eb.resource(CardResource.ORE, 3).startAction.venus(1);
          });
        }),
      },
    });
  }
}
