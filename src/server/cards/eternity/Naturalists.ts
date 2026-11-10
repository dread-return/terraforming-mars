import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {CardType} from '../../../common/cards/CardType';
import {Card} from '../Card';
import {IProjectCard} from '../IProjectCard';
import {Tag} from '../../../common/cards/Tag';

export class Naturalists extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.AUTOMATED,
      name: CardName.NATURALISTS,
      tags: [Tag.MARS, Tag.PLANT],
      cost: 9,
      requirements: {greeneries: 2},
      victoryPoints: {tag: Tag.BUILDING, each: -1},
      behavior: {
        tr: 1,
        production: {plants: 2},
      },
      metadata: {
        cardNumber: 'E94',
        renderData: CardRenderer.builder((b) => {
          b.tr(1).production((pb) => pb.plants(2));
        }),
        description: 'Requires that you have 2 greeneries in play. Raise your TR 1 step. Increase your plant production 2 steps. -1 VP per building tag you have.',
      },
    });
  }
}
