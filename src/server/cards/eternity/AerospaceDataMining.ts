import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {CardType} from '../../../common/cards/CardType';
import {Card} from '../Card';
import {IProjectCard} from '../IProjectCard';
import {Tag} from '../../../common/cards/Tag';

export class AerospaceDataMining extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.AUTOMATED,
      name: CardName.AEROSPACE_DATA_MINING,
      tags: [Tag.JOVIAN, Tag.SPACE],
      cost: 32,
      victoryPoints: 2,
      behavior: {
        production: {megacredits: 2, titanium: 1},
        drawCard: {count: 1, tag: Tag.SPACE},
      },
      metadata: {
        cardNumber: 'E40',
        renderData: CardRenderer.builder((b) => {
          b.production((pb) => pb.megacredits(2).titanium(1)).cards(1, {secondaryTag: Tag.SPACE});
        }),
        description: 'Increase your M\u20ac production 2 steps and your titanium production 1 step. Reveal cards until you reveal a space card. Take it and discard the rest.',
      },
    });
  }
}
