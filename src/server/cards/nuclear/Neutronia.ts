import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';

export class Neutronia extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.AUTOMATED,
      name: CardName.NEUTRONIA,
      tags: [Tag.CITY, Tag.BUILDING],
      cost: 23,
      victoryPoints: 2,
      behavior: {
        production: {energy: -2, megacredits: 3, steel: 1},
        city: {},
      },

      metadata: {
        cardNumber: 'N05',
        renderData: CardRenderer.builder((b) => {
          b.production((pb) => pb.minus().energy(2).br.plus().megacredits(3).steel(1)).nbsp.city();
        }),
        description: 'Decrease your energy production 2 steps and increase your M€ production 3 steps and your steel production 1 step. Place a city tile.',
      },
    });
  }
}
