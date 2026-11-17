import {CardName} from '../../../common/cards/CardName';
import {CardType} from '../../../common/cards/CardType';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {Card} from '../Card';
import {IProjectCard} from '../IProjectCard';

export class Solarovision extends Card implements IProjectCard {
  constructor() {
    super({
      name: CardName.SOLAROVISION,
      type: CardType.EVENT,
      cost: 7,
      victoryPoints: 2,
      requirements: [{tag: Tag.MERCURY}, {tag: Tag.VENUS}, {tag: Tag.EARTH}, {tag: Tag.MARS}, {tag: Tag.JOVIAN}],
      metadata: {
        cardNumber: 'MM33',
        renderData: CardRenderer.builder((b) => {
          b.vpText('2 VP.');
        }),
        description: 'Requires a Mercury, a Venus, an Earth, a Mars and a Jovian tag.',
      },
    });
  }
}
