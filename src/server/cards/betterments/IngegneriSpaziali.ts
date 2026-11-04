import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {CardPool} from './CardPool';
import {LogHelper} from '../../LogHelper';

export class IngegneriSpaziali extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.AUTOMATED,
      name: CardName.INGEGNERI_SPAZIALI,
      tags: [Tag.SPACE],
      cost: 20,
      victoryPoints: 1,

      metadata: {
        cardNumber: 'B17',
        renderData: CardRenderer.builder((b) => {
          b.text('10').cards(1).colon().cards(1, {secondaryTag: Tag.SPACE}).asterix();
        }),
        description: 'Reveal the top 10 cards of the deck. Take all the space cards. ' +
          'Each opponent, in turn, takes 1 of the rest. Discard the remainder.',
      },
    });
  }

  public override bespokePlay(player: IPlayer) {
    const game = player.game;
    const revealed = game.projectDeck.drawN(game, 10);
    LogHelper.logRevealedCards(player, revealed);
    const pool = new CardPool(revealed, this);
    pool.give(player, revealed.filter((card) => card.tags.includes(Tag.SPACE)));
    for (const opponent of player.opponents) {
      pool.offer(opponent, 1);
    }
    pool.discardRest(player);
    return undefined;
  }
}
