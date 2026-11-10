import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {PreludeCard} from '../prelude/PreludeCard';
import {PreludesExpansion} from '../../preludes/PreludesExpansion';
import {Resource} from '../../../common/Resource';

export class ImpulsiveDigging extends PreludeCard {
  constructor() {
    super({
      name: CardName.IMPULSIVE_DIGGING,
      tags: [],
      metadata: {
        cardNumber: 'EP25',
        renderData: CardRenderer.builder((b) => {
          b.megacredits(-3).text('Draw 4 preludes, play 1.');
        }),
        description: 'Lose 3 M\u20ac. Draw 4 cards from the prelude deck. Choose and play one of them and discard the rest.',
      },
    });
  }

  public override bespokePlay(player: IPlayer) {
    const game = player.game;
    player.stock.deduct(Resource.MEGACREDITS, Math.min(3, player.megaCredits), {log: true});
    const cards = game.preludeDeck.drawN(game, 4);
    if (cards.length === 0) {
      return undefined;
    }
    player.defer(PreludesExpansion.selectPreludeToPlay(player, cards, 'discard', 'add'));
    return undefined;
  }
}
