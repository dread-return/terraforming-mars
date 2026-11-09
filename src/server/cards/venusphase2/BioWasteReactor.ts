import {IProjectCard} from '../IProjectCard';
import {ActionCard} from '../ActionCard';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardResource} from '../../../common/CardResource';
import {CardRenderer} from '../render/CardRenderer';
import {digit} from '../Options';

export class BioWasteReactor extends ActionCard implements IProjectCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.BIO_WASTE_REACTOR,
      tags: [Tag.ANIMAL, Tag.MICROBE],
      cost: 8,

      action: {
        spend: {plants: 4},
        or: {
          behaviors: [
            {
              title: 'Add 2 microbes to any card',
              addResourcesToAnyCard: {count: 2, type: CardResource.MICROBE},
            },
            {
              title: 'Add 1 animal to any card',
              addResourcesToAnyCard: {count: 1, type: CardResource.ANIMAL},
            },
          ],
        },
      },

      metadata: {
        cardNumber: 'V55',
        renderData: CardRenderer.builder((b) => {
          b.action('Spend 4 plants to add 2 microbes or 1 animal to any card.', (eb) => {
            eb.plants(4, {digit}).startAction.resource(CardResource.MICROBE, {amount: 2, digit}).asterix().or().resource(CardResource.ANIMAL).asterix();
          });
        }),
      },
    });
  }
}
