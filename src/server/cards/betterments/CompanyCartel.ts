import {Size} from '../../../common/cards/render/Size';
import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {CardPool} from './CardPool';
import {LogHelper} from '../../LogHelper';
import {all, digit} from '../Options';

export class CompanyCartel extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.EVENT,
      name: CardName.COMPANY_CARTEL,
      cost: 8,

      metadata: {
        cardNumber: 'B50',
        renderData: CardRenderer.builder((b) => {
          b.text('reveal', {size: Size.SMALL}).cards(1).asterix().text('= 2 per player', {size: Size.SMALL}).br;
          b.text('keep', {size: Size.SMALL}).cards(2, {digit}).br;
          b.text('each opponent keeps', {size: Size.SMALL}).cards(1, {all});
        }),
        description: 'Reveal twice as many cards from the deck as there are players. Keep 2. Each opponent, in turn, keeps 1. Discard the rest.',
      },
    });
  }

  public override bespokePlay(player: IPlayer) {
    const game = player.game;
    const revealed = game.projectDeck.drawN(game, 2 * game.players.length);
    LogHelper.logRevealedCards(player, revealed);
    const pool = new CardPool(revealed, this);
    pool.offer(player, 2);
    for (const opponent of player.opponents) {
      pool.offer(opponent, 1);
    }
    pool.discardRest(player);
    return undefined;
  }
}
