import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {ActCard} from '../../mercury/ActCard';
import {Size} from '../../../common/cards/render/Size';

export class ZeroGravityRacing extends ActCard {
  constructor() {
    super({
      name: CardName.ZERO_GRAVITY_RACING,
      kind: 'rivalry',
      steps: 5,
      tags: [],
      victoryPoints: 2,
      metadata: {
        cardNumber: 'ACT47',
        renderData: CardRenderer.builder((b) => {
          b.text('victory: 2 VP', {size: Size.SMALL});
        }),
        description: 'Victory: 2 victory points at the end of the game.',
      },
    });
  }
}
