import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';

export class PublicRelations extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.PUBLIC_RELATIONS,
      tags: [Tag.EARTH],
      cost: 14,
      requirements: {tag: Tag.EARTH, count: 2},

      behavior: {
        production: {megacredits: -1},
      },

      metadata: {
        cardNumber: 'I25',
        renderData: CardRenderer.builder((b) => {
          b.effect('Cards with negative VP do not count for you.', (eb) => {
            eb.text('-?').vpIcon().startEffect.text('0').vpIcon();
          }).br;
          b.production((pb) => pb.megacredits(-1));
        }),
        description: 'Requires 2 Earth tags. Decrease your M€ production 1 step.',
      },
    });
  }
}
