import {IProjectCard} from '../IProjectCard';
import {ActionCard} from '../ActionCard';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardResource} from '../../../common/CardResource';
import {CardRenderer} from '../render/CardRenderer';

export class MartianLizards extends ActionCard implements IProjectCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.MARTIAN_LIZARDS,
      tags: [Tag.ANIMAL],
      cost: 4,
      requirements: {temperature: -2},
      resourceType: CardResource.ANIMAL,
      victoryPoints: {resourcesHere: {}, per: 2},

      action: {
        or: {
          behaviors: [
            {
              title: 'Spend 1 heat to add 1 animal to this card',
              spend: {heat: 1},
              addResources: 1,
            },
            {
              title: 'Spend 6 heat to add 2 animals to this card',
              spend: {heat: 6},
              addResources: 2,
            },
          ],
        },
      },

      metadata: {
        cardNumber: 'B55',
        renderData: CardRenderer.builder((b) => {
          b.action('Spend 1 heat to add 1 animal to this card.', (eb) => {
            eb.heat(1).startAction.resource(CardResource.ANIMAL);
          }).br;
          b.or().br;
          b.action('Spend 6 heat to add 2 animals to this card.', (eb) => {
            eb.heat(6).startAction.resource(CardResource.ANIMAL, 2);
          }).br;
          b.vpText('1 VP per 2 animals on this card.');
        }),
        description: 'Requires -2 C or warmer.',
      },
    });
  }
}
