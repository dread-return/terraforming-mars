import {IProjectCard} from '../IProjectCard';
import {ActionCard} from '../ActionCard';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';

export class PatentPooling extends ActionCard implements IProjectCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.PATENT_POOLING,
      tags: [Tag.SCIENCE],
      cost: 10,

      action: {
        drawCard: {count: 1, pay: true},
      },

      metadata: {
        cardNumber: 'I23',
        renderData: CardRenderer.builder((b) => {
          b.action(undefined, (eb) => eb.empty().startAction.cards(1)).text('Action: Look at the top card and either buy it or discard it', {size: Size.SMALL, uppercase: true});
        }),
      },
    });
  }
}
