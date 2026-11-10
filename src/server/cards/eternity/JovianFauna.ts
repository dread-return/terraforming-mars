import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {CardType} from '../../../common/cards/CardType';
import {Card} from '../Card';
import {IProjectCard} from '../IProjectCard';
import {Tag} from '../../../common/cards/Tag';

export class JovianFauna extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.AUTOMATED,
      name: CardName.JOVIAN_FAUNA,
      tags: [Tag.JOVIAN, Tag.PLANT, Tag.PLANT],
      cost: 10,
      requirements: {tag: Tag.JOVIAN, count: 2},
      behavior: {
        production: {plants: 2},
      },
      metadata: {
        cardNumber: 'E21',
        renderData: CardRenderer.builder((b) => {
          b.production((pb) => pb.plants(2));
        }),
        description: 'Requires 2 Jovian tags. Increase your plant production 2 steps.',
      },
    });
  }
}
