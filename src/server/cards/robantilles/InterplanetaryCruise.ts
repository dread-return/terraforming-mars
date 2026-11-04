import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';

export class InterplanetaryCruise extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.EVENT,
      name: CardName.INTERPLANETARY_CRUISE,
      tags: [Tag.JOVIAN, Tag.SPACE],
      cost: 32,
      requirements: {tr: 27},
      victoryPoints: 4,

      behavior: {
        production: {titanium: 2},
      },

      metadata: {
        cardNumber: 'H65',
        renderData: CardRenderer.builder((b) => {
          b.production((pb) => pb.titanium(2));
        }),
        description: 'Requires a TR of at least 27. Increase your titanium production 2 steps.',
      },
    });
  }
}
