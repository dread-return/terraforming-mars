import {IPlayer} from '../../IPlayer';
import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {StandardProjectCard} from '../StandardProjectCard';
import {SelectCard} from '../../inputs/SelectCard';
import {IProjectCard} from '../IProjectCard';
import {Resource} from '../../../common/Resource';
import {isPostludeName, POSTLUDE_SELL_VALUE} from '../../../common/postludes/Postludes';

/** Postludes: discard any number of postludes from your hand for 3 M€ each. */
export class SellPostludesStandardProject extends StandardProjectCard {
  constructor() {
    super({
      name: CardName.SELL_POSTLUDES_STANDARD_PROJECT,
      cost: 0,
      metadata: {
        cardNumber: 'SPL',
        renderData: CardRenderer.builder((b) =>
          b.standardProject('Discard any number of postludes to gain 3 M€ for each.', (eb) => {
            eb.text('X').cards(1).startAction.megacredits(3, {text: 'x'});
          }),
        ),
      },
    });
  }

  private postludesInHand(player: IPlayer): Array<IProjectCard> {
    return player.cardsInHand.filter((card) => isPostludeName(card.name));
  }

  protected override bespokeCanAct(player: IPlayer): boolean {
    return this.postludesInHand(player).length > 0;
  }

  actionEssence(): void {
    // no-op
  }

  // Selling postludes is not one of the standard projects other cards react to, like Sell Patents.
  protected override projectPlayed(_player: IPlayer) {}

  public action(player: IPlayer): SelectCard<IProjectCard> {
    const postludes = this.postludesInHand(player);
    return new SelectCard(
      'Sell postludes',
      'Sell',
      postludes,
      {max: postludes.length, played: false})
      .andThen((cards) => {
        player.stock.add(Resource.MEGACREDITS, cards.length * POSTLUDE_SELL_VALUE);
        cards.forEach((card) => player.discardCardFromHand(card));
        player.game.log('${0} sold ${1} postlude(s)', (b) => b.player(player).number(cards.length));
        return undefined;
      });
  }
}
