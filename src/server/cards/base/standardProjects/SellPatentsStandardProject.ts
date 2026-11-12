import {isPostludeName} from '../../../../common/postludes/Postludes';
import {IPlayer} from '../../../IPlayer';
import {CardName} from '../../../../common/cards/CardName';
import {CardRenderer} from '../../render/CardRenderer';
import {StandardProjectCard} from '../../StandardProjectCard';
import {SelectCard} from '../../../inputs/SelectCard';
import {IProjectCard} from '../../IProjectCard';
import {Eternity} from '../../eternity/Eternity';

export class SellPatentsStandardProject extends StandardProjectCard {
  constructor() {
    super({
      name: CardName.SELL_PATENTS_STANDARD_PROJECT,
      cost: 0,
      metadata: {
        cardNumber: 'SP8',
        renderData: CardRenderer.builder((b) =>
          b.standardProject('Discard any number of cards to gain that amount of M€.', (eb) => {
            eb.text('X').cards(1).startAction.megacredits(1, {text: 'x'});
          }),
        ),
      },
    });
  }

  protected override bespokeCanAct(player: IPlayer): boolean {
    return this.sellable(player).length > 0;
  }

  // Postludes are sold with their own standard project.
  private sellable(player: IPlayer): Array<IProjectCard> {
    return player.cardsInHand.filter((card) => !isPostludeName(card.name));
  }

  actionEssence(): void {
    // no-op
  }

  public action(player: IPlayer): SelectCard<IProjectCard> {
    const cards = this.sellable(player);
    return new SelectCard(
      'Sell patents',
      'Sell',
      cards,
      {max: cards.length, played: false})
      .andThen((cards) => {
        // Eternity: Patent Valuation Adjustment gives 1 M€ more per card.
        player.megaCredits += cards.length * (1 + Eternity.sellPatentsBonus(player));
        cards.forEach((card) => player.discardCardFromHand(card));
        this.projectPlayed(player);
        player.game.log('${0} sold ${1} patents', (b) => b.player(player).number(cards.length));
        return undefined;
      });
  }
}
