import {IProjectCard} from '../IProjectCard';
import {Tag} from '../../../common/cards/Tag';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {PartyName} from '../../../common/turmoil/PartyName';

export class GiantIndustrialComplex extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.AUTOMATED,
      name: CardName.GIANT_INDUSTRIAL_COMPLEX,
      tags: [Tag.BUILDING],
      cost: 24,
      requirements: {party: PartyName.MARS},

      behavior: {
        production: {steel: 1, titanium: 1, energy: 1, heat: 1},
      },

      metadata: {
        cardNumber: 'S25',
        renderData: CardRenderer.builder((b) => {
          b.production((pb) => pb.steel(1).titanium(1).energy(1).heat(1));
        }),
        description: 'Requires that Mars First is ruling or that you have 2 delegates there. Increase your steel, titanium, energy and heat production 1 step each.',
      },
    });
  }
}
