import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {Resource} from '../../../common/Resource';
import {SelectCard} from '../../inputs/SelectCard';
import {all} from '../Options';

export class CompanyRestructuring extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.EVENT,
      name: CardName.COMPANY_RESTRUCTURING,
      tags: [Tag.EARTH],
      cost: 8,
      victoryPoints: 1,

      metadata: {
        cardNumber: 'B38',
        renderData: CardRenderer.builder((b) => {
          b.text('X').cards(1).colon().megacredits(3).text('X').br;
          b.text('X').cards(1, {all}).colon().megacredits(2, {all}).text('X');
        }),
        description: 'Discard any number of cards from hand and gain 3 M€ each. Each opponent may do the same and gain 2 M€ each.',
      },
    });
  }

  public override bespokePlay(player: IPlayer) {
    // Deferred so this card has left the hand before the choice is made.
    CompanyRestructuring.offer(player, 3, this);
    for (const opponent of player.opponents) {
      CompanyRestructuring.offer(opponent, 2, this);
    }
    return undefined;
  }

  private static offer(player: IPlayer, value: number, source: CompanyRestructuring) {
    player.defer(() => {
      if (player.cardsInHand.length === 0) {
        return undefined;
      }
      return new SelectCard(
        `Select any number of cards to discard for ${value} M€ each`,
        'Discard',
        player.cardsInHand,
        {min: 0, max: player.cardsInHand.length})
        .andThen((cards) => {
          for (const card of cards) {
            player.discardCardFromHand(card);
          }
          if (cards.length > 0) {
            player.stock.add(Resource.MEGACREDITS, value * cards.length, {log: true});
            player.game.log('${0} discarded ${1} card(s) with ${2}', (b) => b.player(player).number(cards.length).card(source));
          }
          return undefined;
        });
    });
  }
}
