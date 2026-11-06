import {IProjectCard} from '../IProjectCard';
import {ActionCard} from '../ActionCard';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardResource} from '../../../common/CardResource';
import {CardRenderer} from '../render/CardRenderer';
import {digit} from '../Options';

export class Reptiles extends ActionCard implements IProjectCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.REPTILES,
      tags: [Tag.ANIMAL],
      cost: 8,
      requirements: {temperature: 0},
      resourceType: CardResource.ANIMAL,
      victoryPoints: {resourcesHere: {}},

      action: {
        spend: {heat: 5},
        addResources: 1,
      },

      metadata: {
        cardNumber: 'I65',
        renderData: CardRenderer.builder((b) => {
          b.action('Spend 5 heat to add an animal to this card.', (eb) => {
            eb.heat(5, {digit}).startAction.resource(CardResource.ANIMAL);
          }).br;
          b.vpText('1 VP for every animal on this card.');
        }),
        description: 'Requires 0 °C or warmer.',
      },
    });
  }
}
