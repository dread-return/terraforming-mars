import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';

export class HiddenCity extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.AUTOMATED,
      name: CardName.HIDDEN_CITY,
      tags: [Tag.MARS, Tag.CITY, Tag.BUILDING],
      cost: 14,
      requirements: {tag: Tag.MARS, count: 2},
      victoryPoints: 1,

      behavior: {
        production: {energy: -1, megacredits: 2},
      },

      metadata: {
        cardNumber: 'I33',
        renderData: CardRenderer.builder((b) => {
          b.production((pb) => pb.minus().energy(1).br.megacredits(2)).nbsp.city().asterix();
        }),
        description: 'Requires 2 Mars tags. Energy prod -1, M€ prod +2. ' +
          'At game end, after final greeneries, place a city on Mars (or in space if no area on Mars is free).',
      },
    });
  }

  /** Set once the end-game city has been placed (or couldn't be). */
  public generationUsed: number | undefined = undefined;
}
