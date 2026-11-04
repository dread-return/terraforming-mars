import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';

export class StatueOfVonBraun extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.AUTOMATED,
      name: CardName.STATUE_OF_VON_BRAUN,
      tags: [Tag.MARS, Tag.EARTH, Tag.SPACE],
      cost: 29,
      victoryPoints: {tag: Tag.SPACE, per: 2},

      metadata: {
        cardNumber: 'H29',
        renderData: CardRenderer.builder((b) => {
          b.vpText('1 VP per 2 space tags you have.');
        }),
      },
    });
  }
}
