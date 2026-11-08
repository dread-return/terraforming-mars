import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {all, digit} from '../Options';

export class SupernovaExplosion extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.EVENT,
      name: CardName.SUPERNOVA_EXPLOSION,
      tags: [Tag.SPACE],
      cost: 22,

      behavior: {
        global: {temperature: 1},
        stock: {energy: 5, heat: 5},
        removeAnyPlants: 4,
      },

      metadata: {
        cardNumber: 'H43',
        renderData: CardRenderer.builder((b) => {
          b.temperature(1).nbsp.energy(5, {digit}).nbsp.heat(5, {digit}).br;
          b.minus().plants(4, {all, digit});
        }),
        description: 'Raise the temperature 1 step. Gain 5 energy and 5 heat. Remove up to 4 plants from any player.',
      },
    });
  }
}
