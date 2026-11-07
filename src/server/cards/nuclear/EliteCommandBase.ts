import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {PreludeCard} from '../prelude/PreludeCard';
import {CardRenderer} from '../render/CardRenderer';

export class EliteCommandBase extends PreludeCard {
  constructor() {
    super({
      name: CardName.ELITE_COMMAND_BASE,
      tags: [Tag.BUILDING],
      behavior: {
        production: {megacredits: 1, energy: 1},
        stock: {megacredits: 3, steel: 1, energy: 1},
      },

      metadata: {
        cardNumber: 'P05',
        renderData: CardRenderer.builder((b) => {
          b.production((pb) => pb.megacredits(1).energy(1)).nbsp.megacredits(3).steel(1).energy(1);
        }),
        description: 'Increase your M€ and energy production 1 step. Gain 3 M€, 1 steel and 1 energy.',
      },
    });
  }
}
