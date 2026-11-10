import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {CardType} from '../../../common/cards/CardType';
import {Card} from '../Card';
import {IProjectCard} from '../IProjectCard';
import {Tag} from '../../../common/cards/Tag';

export class PatentedMicroorganisms extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.AUTOMATED,
      name: CardName.PATENTED_MICROORGANISMS,
      tags: [Tag.MICROBE],
      cost: 4,
      behavior: {
        production: {megacredits: 1},
        drawCard: {count: {tag: Tag.MICROBE, per: 3}},
      },
      metadata: {
        cardNumber: 'E100',
        renderData: CardRenderer.builder((b) => {
          b.production((pb) => pb.megacredits(1)).cards(1).slash().tag(Tag.MICROBE, 3);
        }),
        description: 'Increase your M\u20ac production 1 step. Draw a card for every 3 microbe tags you have, including this.',
      },
    });
  }
}
