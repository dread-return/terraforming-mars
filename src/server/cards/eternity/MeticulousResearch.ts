import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {DOUBLE_PRELUDES} from './EternityUtils';
import {IPlayer} from '../../IPlayer';
import {PreludeCard} from '../prelude/PreludeCard';
import {Resource} from '../../../common/Resource';
import {SelectCard} from '../../inputs/SelectCard';
import {Size} from '../../../common/cards/render/Size';

export class MeticulousResearch extends PreludeCard {
  constructor() {
    super({
      name: CardName.METICULOUS_RESEARCH,
      tags: [],
      metadata: {
        cardNumber: 'EP37',
        renderData: CardRenderer.builder((b) => {
          b.megacredits(-6).text('10', {size: Size.MEDIUM}).prelude().asterix();
        }),
        description: 'Pay 6 M\u20ac. Reveal 10 preludes and play one of them (not one that counts as playing two preludes). Discard the rest. Combined, this prelude and the played prelude count as playing only one prelude.',
      },
    });
  }

  public override bespokeCanPlay(player: IPlayer) {
    return player.game.preludeDeck.canDraw(1);
  }
  public override bespokePlay(player: IPlayer) {
    const game = player.game;
    const deck = game.preludeDeck;
    player.stock.deduct(Resource.MEGACREDITS, Math.min(6, player.megaCredits), {log: true});
    const revealed = deck.drawN(game, 10);
    game.log('${0} revealed ${1}', (b) => b.player(player).cards(revealed));
    const playable = revealed.filter((c) => !DOUBLE_PRELUDES.has(c.name) && c.canPlay(player));
    const discardRest = (kept?: typeof revealed[number]) => {
      for (const c of revealed) {
        if (c !== kept) {
          deck.discard(c);
        }
      }
    };
    if (playable.length === 0) {
      discardRest();
      return undefined;
    }
    player.defer(new SelectCard('Select a revealed prelude to play', 'Play', playable).andThen(([card]) => {
      discardRest(card);
      player.playCard(card);
      return undefined;
    }));
    return undefined;
  }
}
