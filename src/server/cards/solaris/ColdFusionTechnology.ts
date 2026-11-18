import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {PartyName} from '../../../common/turmoil/PartyName';

/** S24. */
export class ColdFusionTechnology extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.AUTOMATED,
      name: CardName.COLD_FUSION_TECHNOLOGY,
      tags: [Tag.SCIENCE, Tag.RADIOACTIVE, Tag.POWER],
      cost: 21,
      requirements: {party: PartyName.EMPOWER},

      behavior: {
        production: {heat: -2, energy: 5},
      },

      metadata: {
        cardNumber: 'S24',
        renderData: CardRenderer.builder((b) => {
          b.production((pb) => pb.minus().heat(2).nbsp.plus().energy(5));
        }),
        description: 'Requires that Empower are ruling or that you have 2 delegates there. Decrease your heat production 2 steps and increase your energy production 5 steps.',
      },
    });
  }
}
