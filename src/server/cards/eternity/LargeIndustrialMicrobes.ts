import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {CardType} from '../../../common/cards/CardType';
import {Card} from '../Card';
import {IProjectCard} from '../IProjectCard';
import {Tag} from '../../../common/cards/Tag';

export class LargeIndustrialMicrobes extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.AUTOMATED,
      name: CardName.LARGE_INDUSTRIAL_MICROBES,
      tags: [Tag.MICROBE, Tag.BUILDING],
      cost: 21,
      behavior: {
        production: {energy: 2, steel: 2},
      },
      metadata: {
        cardNumber: 'E81',
        renderData: CardRenderer.builder((b) => {
          b.production((pb) => pb.energy(2).steel(2));
        }),
        description: 'Increase your energy and steel production 2 steps each.',
      },
    });
  }
}
