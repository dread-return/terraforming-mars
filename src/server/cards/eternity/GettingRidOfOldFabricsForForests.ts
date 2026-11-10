import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {CardType} from '../../../common/cards/CardType';
import {Card} from '../Card';
import {IProjectCard} from '../IProjectCard';
import {Tag} from '../../../common/cards/Tag';

export class GettingRidOfOldFabricsForForests extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.AUTOMATED,
      name: CardName.GETTING_RID_OF_OLD_FABRICS_FOR_FORESTS,
      tags: [Tag.PLANT, Tag.BUILDING],
      cost: 6,
      behavior: {
        production: {steel: -2, plants: 2},
        stock: {steel: 2},
      },
      metadata: {
        cardNumber: 'E73',
        renderData: CardRenderer.builder((b) => {
          b.production((pb) => pb.minus().steel(2).plus().plants(2)).steel(2);
        }),
        description: 'Decrease your steel production 2 steps and increase your plant production 2 steps. Gain 2 steel.',
      },
    });
  }
}
