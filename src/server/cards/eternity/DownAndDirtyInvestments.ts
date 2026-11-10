import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {PreludeCard} from '../prelude/PreludeCard';
import {Tag} from '../../../common/cards/Tag';
import {digit} from '../Options';

export class DownAndDirtyInvestments extends PreludeCard {
  constructor() {
    super({
      name: CardName.DOWN_AND_DIRTY_INVESTMENTS,
      tags: [Tag.EARTH],
      behavior: {
        production: {megacredits: 10},
        tr: -3,
      },
      metadata: {
        cardNumber: 'EP12',
        renderData: CardRenderer.builder((b) => {
          b.production((pb) => pb.megacredits(10)).minus().tr(3, {digit});
        }),
        description: 'Increase your M\u20ac production 10 steps. Lower your TR 3 steps.',
      },
    });
  }
}
