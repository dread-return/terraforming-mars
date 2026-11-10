import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {CardType} from '../../../common/cards/CardType';
import {Card} from '../Card';
import {IProjectCard} from '../IProjectCard';
import {Tag} from '../../../common/cards/Tag';

export class PowerSiphon extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.AUTOMATED,
      name: CardName.POWER_SIPHON,
      tags: [Tag.MARS, Tag.POWER, Tag.VENUS],
      cost: 3,
      behavior: {
        tr: -1,
        production: {energy: 1},
        drawCard: 2,
      },
      metadata: {
        cardNumber: 'E103',
        renderData: CardRenderer.builder((b) => {
          b.minus().tr(1).production((pb) => pb.energy(1)).cards(2);
        }),
        description: 'Lower your TR 1 step. Increase your energy production 1 step. Draw 2 cards.',
      },
    });
  }
}
