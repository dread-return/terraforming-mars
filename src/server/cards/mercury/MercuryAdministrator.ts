import {CardName} from '../../../common/cards/CardName';
import {CardType} from '../../../common/cards/CardType';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {Card} from '../Card';
import {IProjectCard} from '../IProjectCard';

export class MercuryAdministrator extends Card implements IProjectCard {
  constructor() {
    super({
      name: CardName.MERCURY_ADMINISTRATOR,
      type: CardType.AUTOMATED,
      tags: [Tag.MERCURY, Tag.MERCURY],
      cost: 4,
      requirements: {tag: Tag.MERCURY, count: 2},
      behavior: {
        production: {megacredits: 3},
      },
      metadata: {
        cardNumber: 'MM07',
        renderData: CardRenderer.builder((b) => {
          b.production((pb) => pb.megacredits(3));
        }),
        description: 'Requires 2 Mercury tags. Increase your M€ production 3 steps.',
      },
    });
  }
}
