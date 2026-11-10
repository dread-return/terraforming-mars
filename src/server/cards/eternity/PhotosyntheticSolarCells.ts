import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {CardType} from '../../../common/cards/CardType';
import {Card} from '../Card';
import {IProjectCard} from '../IProjectCard';
import {Tag} from '../../../common/cards/Tag';

export class PhotosyntheticSolarCells extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.AUTOMATED,
      name: CardName.PHOTOSYNTHETIC_SOLAR_CELLS,
      tags: [Tag.POWER, Tag.BUILDING],
      cost: 25,
      victoryPoints: 2,
      behavior: {
        production: {energy: 2, plants: 1},
      },
      metadata: {
        cardNumber: 'E101',
        renderData: CardRenderer.builder((b) => {
          b.production((pb) => pb.energy(2).plants(1));
        }),
        description: 'Increase your energy production 2 steps and your plant production 1 step.',
      },
    });
  }
}
