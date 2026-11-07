import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardResource} from '../../../common/CardResource';
import {CardRenderer} from '../render/CardRenderer';
import {all} from '../Options';

export class Caracals extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.AUTOMATED,
      name: CardName.CARACALS,
      tags: [Tag.ANIMAL],
      cost: 10,
      requirements: {oxygen: 10},
      behavior: {
        stock: {megacredits: {tag: Tag.ANIMAL, all}},
        addResourcesToAnyCard: {type: CardResource.ANIMAL, count: 2},
      },

      metadata: {
        cardNumber: 'N60',
        renderData: CardRenderer.builder((b) => {
          b.megacredits(1).slash().tag(Tag.ANIMAL, {all}).nbsp.resource(CardResource.ANIMAL, 2).asterix();
        }),
        description: 'Requires 10% oxygen. Gain 1 M€ for every animal tag in play, including this. Add 2 animals to ANY card.',
      },
    });
  }
}
