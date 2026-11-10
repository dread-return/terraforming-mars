import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {CardType} from '../../../common/cards/CardType';
import {Card} from '../Card';
import {IProjectCard} from '../IProjectCard';
import {Tag} from '../../../common/cards/Tag';

export class AncientVenusDiscovery extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.AUTOMATED,
      name: CardName.ANCIENT_VENUS_DISCOVERY,
      tags: [Tag.VENUS],
      cost: 20,
      requirements: {tag: Tag.VENUS, count: 2},
      victoryPoints: 1,
      behavior: {
        global: {venus: 1},
        production: {energy: 1, heat: 1},
        drawCard: 1,
      },
      metadata: {
        cardNumber: 'E42',
        renderData: CardRenderer.builder((b) => {
          b.venus(1).production((pb) => pb.energy(1).heat(1)).cards(1);
        }),
        description: 'Requires 2 Venus tags. Raise Venus 1 step. Increase your energy and heat production 1 step. Draw a card.',
      },
    });
  }
}
