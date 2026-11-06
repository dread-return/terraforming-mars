import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';

export class GalileianTourism extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.AUTOMATED,
      name: CardName.GALILEIAN_TOURISM,
      tags: [Tag.JOVIAN],
      cost: 22,
      requirements: {tag: Tag.JOVIAN, count: 2},
      victoryPoints: {tag: Tag.JOVIAN},

      behavior: {
        production: {megacredits: 1},
      },

      metadata: {
        cardNumber: 'I38',
        renderData: CardRenderer.builder((b) => {
          b.production((pb) => pb.megacredits(1));
        }),
        description: 'Requires 2 Jovian tags. Increase your M€ production 1 step. 1 VP for every Jovian tag you own.',
      },
    });
  }
}
