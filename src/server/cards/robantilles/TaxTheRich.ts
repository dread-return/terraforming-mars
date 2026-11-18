import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Size} from '../../../common/cards/render/Size';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {PartyName} from '../../../common/turmoil/PartyName';
import {SelectPlayer} from '../../inputs/SelectPlayer';
import {Priority} from '../../deferredActions/Priority';

/** H69. Played, it ends up among an opponent's events, with its -2 VP. */
export class TaxTheRich extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.EVENT,
      name: CardName.TAX_THE_RICH,
      tags: [],
      cost: 3,
      victoryPoints: -2,
      requirements: {party: PartyName.POPULISTS},

      metadata: {
        cardNumber: 'H69',
        renderData: CardRenderer.builder((b) => {
          b.text('Put this card into an opponent\'s played events.', {size: Size.SMALL, isBold: false});
        }),
        description: 'Requires that Populists are ruling or that you have 2 delegates there.',
      },
    });
  }

  public override bespokePlay(player: IPlayer) {
    const opponents = player.opponents;
    if (opponents.length === 0) {
      return undefined;
    }
    // Moved once the card has reached its player's played cards.
    player.defer(() => {
      const give = (target: IPlayer) => {
        if (player.playedCards.has(this.name)) {
          player.playedCards.remove(this);
        }
        target.playedCards.push(this);
        player.game.log('${0} put ${1} into ${2}\'s played events', (b) => b.player(player).card(this).player(target));
        return undefined;
      };
      if (opponents.length === 1) {
        return give(opponents[0]);
      }
      return new SelectPlayer(opponents, 'Select the opponent who gets Tax the Rich', 'Give').andThen(give);
    }, Priority.BACK_OF_THE_LINE);
    return undefined;
  }
}
