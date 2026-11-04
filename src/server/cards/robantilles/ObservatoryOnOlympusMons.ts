import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';

export class ObservatoryOnOlympusMons extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.AUTOMATED,
      name: CardName.OBSERVATORY_ON_OLYMPUS_MONS,
      tags: [Tag.MARS, Tag.SCIENCE, Tag.BUILDING],
      cost: 10,

      behavior: {
        drawCard: {count: {tag: Tag.SPACE, per: 2}},
      },

      metadata: {
        cardNumber: 'H50',
        renderData: CardRenderer.builder((b) => {
          b.cards(1).slash().text('2').tag(Tag.SPACE);
        }),
        description: 'Draw a card for every 2 space tags you have.',
      },
    });
  }
}
