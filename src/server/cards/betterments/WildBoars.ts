import {IProjectCard} from '../IProjectCard';
import {ActionCard} from '../ActionCard';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardResource} from '../../../common/CardResource';
import {CardRenderer} from '../render/CardRenderer';
import {all} from '../Options';

export class WildBoars extends ActionCard implements IProjectCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.WILD_BOARS,
      tags: [Tag.ANIMAL],
      cost: 12,
      requirements: {oxygen: 11},
      resourceType: CardResource.ANIMAL,
      victoryPoints: {resourcesHere: {}},

      action: {
        removeAnyPlants: 1,
        addResources: 1,
      },

      metadata: {
        cardNumber: 'B26',
        renderData: CardRenderer.builder((b) => {
          b.action('Remove 1 plant from any player to add 1 animal to this card.', (eb) => {
            eb.minus().plants(1, {all}).startAction.resource(CardResource.ANIMAL);
          }).br;
          b.vpText('1 VP per animal on this card.');
        }),
        description: 'Requires 11% oxygen.',
      },
    });
  }
}
