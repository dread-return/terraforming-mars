import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {CardType} from '../../../common/cards/CardType';
import {Card} from '../Card';
import {IProjectCard} from '../IProjectCard';
import {Tag} from '../../../common/cards/Tag';
import {all} from '../Options';

export class PressurizedAsteroid extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.EVENT,
      name: CardName.PRESSURIZED_ASTEROID,
      tags: [Tag.SPACE, Tag.EVENT],
      cost: 30,
      behavior: {
        global: {oxygen: 2},
        ocean: {},
        removeAnyPlants: 2,
      },
      metadata: {
        cardNumber: 'E105',
        renderData: CardRenderer.builder((b) => {
          b.oxygen(2).oceans(1).minus().plants(2, {all});
        }),
        description: 'Raise oxygen 2 steps. Place an ocean. Remove up to 2 plants from any player.',
      },
    });
  }
}
