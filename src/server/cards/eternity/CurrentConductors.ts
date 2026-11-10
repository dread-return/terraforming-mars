import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {CardType} from '../../../common/cards/CardType';
import {Card} from '../Card';
import {IProjectCard} from '../IProjectCard';
import {Tag} from '../../../common/cards/Tag';

export class CurrentConductors extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.AUTOMATED,
      name: CardName.CURRENT_CONDUCTORS,
      tags: [Tag.POWER],
      cost: 6,
      victoryPoints: 1,
      behavior: {
        stock: {energy: 4},
      },
      metadata: {
        cardNumber: 'E61',
        renderData: CardRenderer.builder((b) => {
          b.energy(4);
        }),
        description: 'Gain 4 energy.',
      },
    });
  }
}
