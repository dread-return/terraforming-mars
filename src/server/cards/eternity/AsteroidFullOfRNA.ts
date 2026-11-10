import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {CardResource} from '../../../common/CardResource';
import {CardType} from '../../../common/cards/CardType';
import {Card} from '../Card';
import {IProjectCard} from '../IProjectCard';
import {Tag} from '../../../common/cards/Tag';

export class AsteroidFullOfRNA extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.EVENT,
      name: CardName.ASTEROID_FULL_OF_RNA,
      tags: [Tag.SPACE],
      cost: 22,
      behavior: {
        global: {temperature: 1, oxygen: 1},
        addResourcesToAnyCard: {count: 2, type: CardResource.MICROBE},
        stock: {plants: 2},
      },
      metadata: {
        cardNumber: 'E45',
        renderData: CardRenderer.builder((b) => {
          b.temperature(1).oxygen(1).br.resource(CardResource.MICROBE, 2).asterix().plants(2);
        }),
        description: 'Raise the temperature 1 step and oxygen 1 step. Add 2 microbes to another card. Gain 2 plants.',
      },
    });
  }
}
