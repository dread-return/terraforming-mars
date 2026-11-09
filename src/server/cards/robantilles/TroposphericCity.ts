import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';

/** Rob Antilles H24. Needs the Venus map (Venus Phase 2) for its city. */
export class TroposphericCity extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.AUTOMATED,
      name: CardName.TROPOSPHERIC_CITY,
      tags: [Tag.CITY, Tag.VENUS, Tag.JOVIAN],
      cost: 27,
      victoryPoints: {tag: Tag.VENUS, per: 2},

      behavior: {
        venusMap: {city: 1},
      },

      metadata: {
        cardNumber: 'H24',
        renderData: CardRenderer.builder((b) => {
          b.city().asterix();
          b.vpText('1 VP for every 2 Venus tags you have.');
        }),
        description: 'Place this city on Venus.',
      },
    });
  }
}
