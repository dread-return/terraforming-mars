import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {CardType} from '../../../common/cards/CardType';
import {Card} from '../Card';
import {IProjectCard} from '../IProjectCard';
import {Tag} from '../../../common/cards/Tag';
import {all} from '../Options';

export class CollapsedAsteroid extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.EVENT,
      name: CardName.COLLAPSED_ASTEROID,
      tags: [Tag.SPACE],
      cost: 11,
      behavior: {
        tr: 1,
        stock: {heat: 2},
        removeAnyPlants: 1,
      },
      metadata: {
        cardNumber: 'E56',
        renderData: CardRenderer.builder((b) => {
          b.tr(1).heat(2).minus().plants(1, {all});
        }),
        description: 'Raise your TR 1 step. Gain 2 heat. Remove up to 1 plant from any player.',
      },
    });
  }
}
