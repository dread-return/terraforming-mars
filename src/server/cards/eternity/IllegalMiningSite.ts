import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {CardType} from '../../../common/cards/CardType';
import {Card} from '../Card';
import {IProjectCard} from '../IProjectCard';
import {Tag} from '../../../common/cards/Tag';

export class IllegalMiningSite extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.AUTOMATED,
      name: CardName.ILLEGAL_MINING_SITE,
      tags: [Tag.BUILDING],
      cost: 20,
      victoryPoints: -2,
      behavior: {
        production: {steel: 2, titanium: 1},
      },
      metadata: {
        cardNumber: 'E78',
        renderData: CardRenderer.builder((b) => {
          b.production((pb) => pb.steel(2).titanium(1));
        }),
        description: 'Increase your steel production 2 steps and your titanium production 1 step.',
      },
    });
  }
}
