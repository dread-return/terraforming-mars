import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {PreludeCard} from '../prelude/PreludeCard';
import {Tag} from '../../../common/cards/Tag';

export class MiningSponsors extends PreludeCard {
  constructor() {
    super({
      name: CardName.MINING_SPONSORS,
      tags: [Tag.EARTH, Tag.BUILDING],
      victoryPoints: 1,
      behavior: {
        production: {megacredits: 2},
        stock: {steel: 3},
      },
      metadata: {
        cardNumber: 'EP39',
        renderData: CardRenderer.builder((b) => {
          b.production((pb) => pb.megacredits(2)).steel(3);
        }),
        description: 'Increase your M\u20ac production 2 steps. Gain 3 steel.',
      },
    });
  }
}
