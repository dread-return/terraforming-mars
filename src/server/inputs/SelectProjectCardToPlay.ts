import {Payment} from '../../common/inputs/Payment';
import {IProjectCard} from '../cards/IProjectCard';
import {Units} from '../../common/Units';
import {MoonExpansion} from '../moon/MoonExpansion';
import {CardAction, IPlayer} from '../IPlayer';
import {Message} from '../../common/logs/Message';
import {SelectCardToPlay} from './SelectCardToPlay';
import {Tag} from '../../common/cards/Tag';

/** Steel/titanium rules for this card that its tags alone don't show (sent to the client's payment widget). */
function paymentOverrides(player: IPlayer, card: IProjectCard): {steel?: boolean, titanium?: boolean, steelValue?: number, graphene?: boolean, grapheneValue?: number} | undefined {
  const options = player.paymentOptionsForCard(card);
  const result: {steel?: boolean, titanium?: boolean, steelValue?: number, graphene?: boolean, grapheneValue?: number} = {};
  if (options.steel && !card.tags.includes(Tag.BUILDING)) {
    result.steel = true;
  }
  if (options.titanium && !card.tags.includes(Tag.SPACE)) {
    result.titanium = true;
  }
  if (options.steelValue !== undefined) {
    result.steelValue = options.steelValue;
  }
  if (options.graphene && !card.tags.includes(Tag.CITY) && !card.tags.includes(Tag.SPACE)) {
    result.graphene = true;
  }
  if (options.grapheneValue !== undefined) {
    result.grapheneValue = options.grapheneValue;
  }
  return Object.keys(result).length > 0 ? result : undefined;
}

export class SelectProjectCardToPlay extends SelectCardToPlay<IProjectCard> {
  constructor(
    player: IPlayer,
    cards: Array<IProjectCard> = player.getPlayableCards(),
    config?: {
      action?: CardAction,
      enabled?: ReadonlyArray<boolean>,
      title?: string | Message,
      buttonLabel?: string,
    }) {
    super(player, cards, config);
    this.extras = new Map(
      cards.map((card) => {
        return [
          card.name,
          {
            reserveUnits: card.reserveUnits ?
              MoonExpansion.adjustedReserveCosts(player, card) :
              Units.EMPTY,
            paymentOverrides: paymentOverrides(player, card),
          },
        ];
      }));
  }

  // Public for tests
  public payAndPlay(card: IProjectCard, payment: Payment) {
    this.player.checkPaymentAndPlayCard(card, payment, this.config?.action);
    this.cb(card);
  }

  protected override validate(): void {
    // No additional validation
  }
}
