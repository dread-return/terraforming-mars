import {IProjectCard} from '../IProjectCard';
import {ActionCard} from '../ActionCard';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardResource} from '../../../common/CardResource';
import {CardRenderer} from '../render/CardRenderer';
import {max} from '../Options';

export class FloatingRig extends ActionCard implements IProjectCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.FLOATING_RIG,
      tags: [Tag.VENUS, Tag.BUILDING],
      cost: 6,
      requirements: {venus: 16, max},
      resourceType: CardResource.FLOATER,
      victoryPoints: {resourcesHere: {}, per: 2},

      behavior: {
        production: {energy: 3},
      },

      action: {
        spend: {steel: 1},
        addResources: 1,
      },

      metadata: {
        cardNumber: 'I47',
        renderData: CardRenderer.builder((b) => {
          b.action('Spend 1 steel to add a floater to this card.', (eb) => {
            eb.steel(1).startAction.resource(CardResource.FLOATER);
          }).br;
          b.production((pb) => pb.energy(3));
        }),
        description: 'Requires Venus 16% or lower. Increase your energy production 3 steps.',
      },
    });
  }
}
