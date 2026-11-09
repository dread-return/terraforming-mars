import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardResource} from '../../../common/CardResource';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {SelectCard} from '../../inputs/SelectCard';
import {SelectPaymentDeferred} from '../../deferredActions/SelectPaymentDeferred';

/** Venus Tradeship costs 2X M€: X is chosen when it is played. */
export class VenusTradeship extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.EVENT,
      name: CardName.VENUS_TRADESHIP,
      tags: [Tag.VENUS],
      cost: 0,

      metadata: {
        cardNumber: 'V92',
        renderData: CardRenderer.builder((b) => {
          b.text('X').cards(1, {secondaryTag: Tag.VENUS}).colon().resource(CardResource.FLOATER).asterix();
        }),
        description: 'Costs 2X M€. Choose X of your cards that collect floaters and add 1 floater to each of them.',
      },
    });
  }

  private static floaterCards(player: IPlayer) {
    return player.getResourceCards(CardResource.FLOATER);
  }

  public override bespokeCanPlay(player: IPlayer) {
    return VenusTradeship.floaterCards(player).length > 0 && player.canAfford(2);
  }

  public override bespokePlay(player: IPlayer) {
    const cards = VenusTradeship.floaterCards(player);
    const budget = player.spendableMegacredits();
    const max = Math.min(cards.length, Math.floor(budget / 2));
    if (max < 1) {
      return undefined;
    }
    return new SelectCard('Select cards to add 1 floater each (2 M€ per card)', 'Add floaters', cards, {min: 1, max})
      .andThen((selected) => {
        player.game.defer(new SelectPaymentDeferred(player, 2 * selected.length, {title: 'Pay for Venus Tradeship'}))
          .andThen(() => {
            for (const card of selected) {
              player.addResourceTo(card, {qty: 1, log: true});
            }
          });
        return undefined;
      });
  }
}
