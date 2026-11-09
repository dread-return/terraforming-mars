import {IProjectCard} from '../IProjectCard';
import {ActionCard} from '../ActionCard';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardResource} from '../../../common/CardResource';
import {CardRenderer} from '../render/CardRenderer';

export class FloaterFactory extends ActionCard implements IProjectCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.FLOATER_FACTORY,
      tags: [Tag.VENUS, Tag.BUILDING],
      cost: 16,
      victoryPoints: 1,

      behavior: {
        production: {heat: 1},
      },

      action: {
        spend: {heat: 1},
        addResourcesToAnyCard: {count: 1, type: CardResource.FLOATER},
      },

      metadata: {
        cardNumber: 'V79',
        renderData: CardRenderer.builder((b) => {
          b.action('Spend 1 heat to add a floater to any card.', (eb) => {
            eb.heat(1).startAction.resource(CardResource.FLOATER).asterix();
          }).br;
          b.production((pb) => pb.heat(1));
        }),
        description: 'Increase your heat production 1 step.',
      },
    });
  }
}
