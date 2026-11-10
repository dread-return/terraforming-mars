import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {CardType} from '../../../common/cards/CardType';
import {Card} from '../Card';
import {IProjectCard} from '../IProjectCard';
import {Tag} from '../../../common/cards/Tag';
import {all} from '../Options';
import {digit} from '../Options';

export class OverheatedAsteroid extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.EVENT,
      name: CardName.OVERHEATED_ASTEROID,
      tags: [Tag.SPACE, Tag.EVENT],
      cost: 26,
      behavior: {
        global: {temperature: 1},
        stock: {heat: 10},
        removeAnyPlants: 2,
      },
      metadata: {
        cardNumber: 'E97',
        renderData: CardRenderer.builder((b) => {
          b.temperature(1).heat(10, {digit}).minus().plants(2, {all});
        }),
        description: 'Raise the temperature 1 step. Gain 10 heat. Remove up to 2 plants from any player.',
      },
    });
  }
}
