import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {PartyName} from '../../../common/turmoil/PartyName';

export class TharsisColossus extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.AUTOMATED,
      name: CardName.THARSIS_COLOSSUS,
      tags: [Tag.MARS, Tag.BUILDING],
      cost: 14,
      requirements: {party: PartyName.MARS},
      victoryPoints: {tag: Tag.BUILDING, per: 3},

      metadata: {
        cardNumber: 'H30',
        renderData: CardRenderer.builder((b) => {
          b.vpText('1 VP per 3 building tags you have.');
        }),
        description: 'Requires that Mars First are ruling or that you have 2 delegates there.',
      },
    });
  }
}
