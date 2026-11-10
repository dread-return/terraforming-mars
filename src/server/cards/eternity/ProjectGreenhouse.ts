import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {PreludeCard} from '../prelude/PreludeCard';
import {Tag} from '../../../common/cards/Tag';

export class ProjectGreenhouse extends PreludeCard {
  constructor() {
    super({
      name: CardName.PROJECT_GREENHOUSE,
      tags: [Tag.PLANT],
      behavior: {
        production: {plants: 1, heat: 1},
        stock: {megacredits: 8},
      },
      metadata: {
        cardNumber: 'EP46',
        renderData: CardRenderer.builder((b) => {
          b.production((pb) => pb.plants(1).heat(1)).megacredits(8);
        }),
        description: 'Increase your plant and heat production 1 step. Gain 8 M\u20ac.',
      },
    });
  }
}
