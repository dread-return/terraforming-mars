import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {CardType} from '../../../common/cards/CardType';
import {Card} from '../Card';
import {IPlayer} from '../../IPlayer';
import {IProjectCard} from '../IProjectCard';
import {SelectCard} from '../../inputs/SelectCard';
import {SelectPaymentDeferred} from '../../deferredActions/SelectPaymentDeferred';
import {Size} from '../../../common/cards/render/Size';
import {Tag} from '../../../common/cards/Tag';

export class SunsetOverArsiaMons extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.AUTOMATED,
      name: CardName.SUNSET_OVER_ARSIA_MONS,
      tags: [Tag.MARS],
      cost: 12,
      victoryPoints: 2,
      metadata: {
        cardNumber: 'E125',
        renderData: CardRenderer.builder((b) => {
          b.minus().cards(1).asterix().equals().megacredits(-2).br;
          b.text('Each card you discard as you play this counts as 2 M€ toward its cost.', {size: Size.SMALL, isBold: false});
        }),
      },
    });
  }

  /** The cost reduction already assumed (see Eternity.cardCostAdjustment): 2 M€ per other card in hand, up to 6. */
  public static assumedDiscards(player: IPlayer): number {
    return Math.max(0, Math.min(6, player.cardsInHand.length - 1));
  }
  public override bespokePlay(player: IPlayer) {
    const assumed = SunsetOverArsiaMons.assumedDiscards(player);
    if (assumed === 0) {
      return undefined;
    }
    player.defer(() => {
      const hand = player.cardsInHand.filter((c) => c !== this);
      const min = Math.max(0, assumed - Math.floor(player.spendableMegacredits() / 2));
      return new SelectCard(`Discard up to ${assumed} cards (2 M€ each toward the cost; pay 2 M€ for each one you keep)`, 'Discard', hand, {min: min, max: assumed}).andThen((cards) => {
        for (const c of cards) {
          player.discardCardFromHand(c, {log: true});
        }
        const owed = (assumed - cards.length) * 2;
        if (owed > 0) {
          player.game.defer(new SelectPaymentDeferred(player, owed, {title: 'Pay the rest of Sunset over Arsia Mons'}));
        }
        return undefined;
      });
    });
    return undefined;
  }
}
