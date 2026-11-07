import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';

export class MissileDefenseMatrix extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.AUTOMATED,
      name: CardName.MISSILE_DEFENSE_MATRIX,
      tags: [Tag.RADIOACTIVE, Tag.EARTH],
      cost: 25,
      victoryPoints: {tag: Tag.RADIOACTIVE, per: 2},
      behavior: {
        global: {temperature: 1},
        drawCard: {count: {tag: Tag.RADIOACTIVE, per: 2}},
      },

      metadata: {
        cardNumber: 'N71',
        renderData: CardRenderer.builder((b) => {
          b.temperature(1).nbsp.cards(1).slash().tag(Tag.RADIOACTIVE, 2);
        }),
        description: 'Raise the temperature 1 step. Draw a card for every 2 radioactive tags you own, including this. 1 VP for every 2 radioactive tags you own.',
      },
    });
  }
}
