import {IProjectCard} from '../IProjectCard';
import {ActionCard} from '../ActionCard';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {CardResource} from '../../../common/CardResource';

export class PrehistoricBeasts extends ActionCard implements IProjectCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.PREHISTORIC_BEASTS,
      tags: [Tag.ANIMAL],
      cost: 10,
      requirements: {tag: Tag.SCIENCE, count: 5},
      resourceType: CardResource.ANIMAL,
      victoryPoints: {resourcesHere: {}},

      behavior: {
        production: {megacredits: 2},
      },

      action: {
        spend: {plants: 2},
        addResources: 1,
      },

      metadata: {
        cardNumber: 'H51',
        renderData: CardRenderer.builder((b) => {
          b.action('Spend 2 plants to add an animal to this card.', (eb) => {
            eb.plants(2).startAction.resource(CardResource.ANIMAL);
          }).br;
          b.production((pb) => pb.megacredits(2)).br;
          b.vpText('1 VP per animal on this card.');
        }),
        description: 'Requires 5 science tags. Increase your M€ production 2 steps.',
      },
    });
  }
}
