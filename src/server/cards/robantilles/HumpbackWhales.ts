import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';

export class HumpbackWhales extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.AUTOMATED,
      name: CardName.HUMPBACK_WHALES,
      tags: [Tag.ANIMAL],
      cost: 12,
      requirements: {oceans: 8},
      victoryPoints: 3,

      metadata: {
        cardNumber: 'H12',
        description: 'Requires 8 ocean tiles.',
      },
    });
  }
}
