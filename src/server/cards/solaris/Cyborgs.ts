import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {PartyName} from '../../../common/turmoil/PartyName';

/** S22. */
export class Cyborgs extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.AUTOMATED,
      name: CardName.CYBORGS,
      tags: [Tag.WILD],
      cost: 14,
      victoryPoints: 1,
      requirements: {party: PartyName.TRANSHUMANISTS},

      behavior: {
        production: {megacredits: 1},
      },

      metadata: {
        cardNumber: 'S22',
        renderData: CardRenderer.builder((b) => {
          b.production((pb) => pb.megacredits(1));
        }),
        description: 'Requires that Transhumanists are ruling or that you have 2 delegates there. Increase your M€ production 1 step. The wild tag counts as any tag.',
      },
    });
  }
}
