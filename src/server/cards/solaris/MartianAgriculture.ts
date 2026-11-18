import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {PartyName} from '../../../common/turmoil/PartyName';

/** S26. */
export class MartianAgriculture extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.AUTOMATED,
      name: CardName.MARTIAN_AGRICULTURE,
      tags: [Tag.SCIENCE, Tag.PLANT, Tag.BUILDING],
      cost: 42,
      victoryPoints: 1,
      requirements: {party: PartyName.SPOME},

      behavior: {
        production: {plants: 5},
      },

      metadata: {
        cardNumber: 'S26',
        renderData: CardRenderer.builder((b) => {
          b.production((pb) => pb.plants(5));
        }),
        description: 'Requires that Spome are ruling or that you have 2 delegates there. Increase your plant production 5 steps.',
      },
    });
  }
}
