import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {PreludeCard} from '../prelude/PreludeCard';
import {Tag} from '../../../common/cards/Tag';

export class UnknownTerritory extends PreludeCard {
  constructor() {
    super({
      name: CardName.UNKNOWN_TERRITORY,
      tags: [Tag.POWER, Tag.SCIENCE, Tag.WILD],
      behavior: {
        drawCard: 2,
        production: {megacredits: 1, energy: 1},
      },
      metadata: {
        cardNumber: 'EP63',
        renderData: CardRenderer.builder((b) => {
          b.cards(2).production((pb) => pb.megacredits(1).energy(1));
        }),
        description: 'Draw 2 cards. Increase your M\u20ac and energy production 1 step each.',
      },
    });
  }
}
