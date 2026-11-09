import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';

export class HighPressureSuits extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.AUTOMATED,
      name: CardName.HIGH_PRESSURE_SUITS,
      tags: [Tag.JOVIAN],
      cost: 8,
      victoryPoints: 2,
      requirements: {tag: Tag.JOVIAN, count: 2, max: true},

      metadata: {
        cardNumber: 'V73',
        description: 'You must have at most 2 Jovian tags.',
      },
    });
  }
}
