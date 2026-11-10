import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {CardType} from '../../../common/cards/CardType';
import {Card} from '../Card';
import {IProjectCard} from '../IProjectCard';
import {Tag} from '../../../common/cards/Tag';

export class UnstableElementMining extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.AUTOMATED,
      name: CardName.UNSTABLE_ELEMENT_MINING,
      tags: [Tag.RADIOACTIVE, Tag.POWER, Tag.BUILDING],
      cost: 13,
      behavior: {
        production: {energy: 2, steel: 1, titanium: 1},
        tr: -2,
      },
      metadata: {
        cardNumber: 'E37',
        renderData: CardRenderer.builder((b) => {
          b.production((pb) => pb.energy(2).steel(1).titanium(1)).br.minus().tr(2);
        }),
        description: 'Increase your energy production 2 steps and your steel and titanium production 1 step each. Decrease your TR 2 steps.',
      },
    });
  }
}
