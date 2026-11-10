import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {CardType} from '../../../common/cards/CardType';
import {Card} from '../Card';
import {IProjectCard} from '../IProjectCard';
import {Tag} from '../../../common/cards/Tag';

export class MiningTouristAttraction extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.AUTOMATED,
      name: CardName.MINING_TOURIST_ATTRACTION,
      tags: [Tag.MARS, Tag.BUILDING],
      cost: 14,
      victoryPoints: 1,
      behavior: {
        production: {steel: -1, energy: -1, megacredits: 6},
      },
      metadata: {
        cardNumber: 'E91',
        renderData: CardRenderer.builder((b) => {
          b.production((pb) => pb.minus().steel(1).minus().energy(1).br.plus().megacredits(6));
        }),
        description: 'Decrease your steel and energy production 1 step each. Increase your M\u20ac production 6 steps.',
      },
    });
  }
}
