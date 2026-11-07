import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardResource} from '../../../common/CardResource';
import {PreludeCard} from '../prelude/PreludeCard';
import {CardRenderer} from '../render/CardRenderer';

export class ArtificialSun extends PreludeCard {
  constructor() {
    super({
      name: CardName.ARTIFICIAL_SUN,
      tags: [Tag.CITY, Tag.POWER],
      behavior: {
        drawCard: {count: 2, resource: CardResource.RADIATION},
        production: {heat: 1},
      },

      metadata: {
        cardNumber: 'P04',
        renderData: CardRenderer.builder((b) => {
          b.cards(2).resource(CardResource.RADIATION).asterix().nbsp.production((pb) => pb.heat(1));
        }),
        description: 'Reveal cards from the deck until you reveal 2 cards that hold radiation. Keep them and discard the rest. ' +
          'Increase your heat production 1 step.',
      },
    });
  }
}
