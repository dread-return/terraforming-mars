import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';

export class LaunchOfThePhoenix extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.EVENT,
      name: CardName.LAUNCH_OF_THE_PHOENIX,
      tags: [Tag.SCIENCE, Tag.EARTH, Tag.SPACE],
      cost: 18,
      requirements: {tag: Tag.SCIENCE, count: 7},
      victoryPoints: 5,

      metadata: {
        cardNumber: 'H14',
        description: 'Requires 7 science tags.',
      },
    });
  }
}
