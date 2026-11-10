import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {PreludeCard} from '../prelude/PreludeCard';
import {Resource} from '../../../common/Resource';
import {SelectCard} from '../../inputs/SelectCard';

export class MeticulousResearch extends PreludeCard {
  constructor() {
    super({
      name: CardName.METICULOUS_RESEARCH,
      tags: [],
      metadata: {
        cardNumber: 'EP37',
        renderData: CardRenderer.builder((b) => {
          b.megacredits(-6).text('Search the prelude deck and play a prelude.');
        }),
        description: 'Pay 6 M\u20ac. Search the prelude deck for any prelude and play it. Combined, this prelude and the searched prelude count as playing only one prelude.',
      },
    });
  }

  public override bespokeCanPlay(player: IPlayer) {
    return player.game.preludeDeck.drawPile.length > 0;
  }
  public override bespokePlay(player: IPlayer) {
    const deck = player.game.preludeDeck;
    player.stock.deduct(Resource.MEGACREDITS, Math.min(6, player.megaCredits), {log: true});
    player.defer(new SelectCard('Search the prelude deck for a prelude to play', 'Play', deck.drawPile.slice()).andThen(([card]) => {
      deck.drawPile.splice(deck.drawPile.indexOf(card), 1);
      deck.shuffle();
      player.playCard(card);
      return undefined;
    }));
    return undefined;
  }
}
