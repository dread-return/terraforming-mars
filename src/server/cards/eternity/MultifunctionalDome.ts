import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {CardType} from '../../../common/cards/CardType';
import {Card} from '../Card';
import {IProjectCard} from '../IProjectCard';
import {Tag} from '../../../common/cards/Tag';

export class MultifunctionalDome extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.AUTOMATED,
      name: CardName.MULTIFUNCTIONAL_DOME,
      tags: [Tag.PLANT, Tag.BUILDING],
      cost: 35,
      behavior: {
        production: {plants: 2, steel: 2, energy: -1},
        tr: 1,
      },
      metadata: {
        cardNumber: 'E93',
        renderData: CardRenderer.builder((b) => {
          b.production((pb) => pb.minus().energy(1).steel(2).br.plants(2)).tr(1);
        }),
        description: 'Increase your plant and steel production 2 steps each. Raise your TR 1 step. Decrease your energy production 1 step.',
      },
    });
  }
}
