import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {ActCard} from '../../mercury/ActCard';
import {IPlayer} from '../../IPlayer';
import {SendDelegateToArea} from '../../deferredActions/SendDelegateToArea';

export class PoliticalRevolution extends ActCard {
  constructor() {
    super({
      name: CardName.POLITICAL_REVOLUTION,
      kind: 'treaty',
      steps: 6,
      tags: [],
      metadata: {
        cardNumber: 'ACT21',
        renderData: CardRenderer.builder((b) => {
          b.delegates(2).asterix().delegates(1).asterix();
        }),
        description: 'Resolve (both): first add 2 delegates to any parties, then add 1 more delegate to any party.',
      },
    });
  }

  public override resolveFor(player: IPlayer) {
    for (let i = 0; i < 3; i++) {
      player.game.defer(new SendDelegateToArea(player));
    }
  }
}
