import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';

export class NeptuneExpedition extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.AUTOMATED,
      name: CardName.NEPTUNE_EXPEDITION,
      tags: [Tag.SCIENCE, Tag.JOVIAN, Tag.SPACE],
      cost: 27,
      victoryPoints: 2,

      behavior: {
        drawCard: {count: {tag: Tag.JOVIAN}},
      },

      metadata: {
        cardNumber: 'H37',
        renderData: CardRenderer.builder((b) => {
          b.cards(1).slash().tag(Tag.JOVIAN);
        }),
        description: 'Draw a card for each Jovian tag you have, including this.',
      },
    });
  }
}
