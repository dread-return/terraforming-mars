import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {CardType} from '../../../common/cards/CardType';
import {Card} from '../Card';
import {IProjectCard} from '../IProjectCard';
import {Tag} from '../../../common/cards/Tag';

export class MarsSolarPowerGrid extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.AUTOMATED,
      name: CardName.MARS_SOLAR_POWER_GRID,
      tags: [Tag.MARS, Tag.POWER],
      cost: 9,
      requirements: [{tag: Tag.MARS}, {tag: Tag.POWER}],
      behavior: {
        production: {energy: 2},
      },
      metadata: {
        cardNumber: 'E24',
        renderData: CardRenderer.builder((b) => {
          b.production((pb) => pb.energy(2));
        }),
        description: 'Requires a Mars tag and a power tag. Increase your energy production 2 steps.',
      },
    });
  }
}
