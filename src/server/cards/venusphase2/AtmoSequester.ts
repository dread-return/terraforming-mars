import {IProjectCard} from '../IProjectCard';
import {ActionCard} from '../ActionCard';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardResource} from '../../../common/CardResource';
import {CardRenderer} from '../render/CardRenderer';
import {digit} from '../Options';

export class AtmoSequester extends ActionCard implements IProjectCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.ATMO_SEQUESTER,
      tags: [Tag.VENUS],
      cost: 13,

      action: {
        spend: {energy: 4},
        global: {venus: 1},
        addResourcesToAnyCard: {count: 1, type: CardResource.FLOATER},
      },

      metadata: {
        cardNumber: 'V51',
        renderData: CardRenderer.builder((b) => {
          b.action('Spend 4 energy to raise Venus 1 step and add a floater to any card.', (eb) => {
            eb.energy(4, {digit}).startAction.venus(1).resource(CardResource.FLOATER).asterix();
          });
        }),
      },
    });
  }
}
