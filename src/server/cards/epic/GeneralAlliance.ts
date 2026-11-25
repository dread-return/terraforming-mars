import {ActiveCorporationCard} from '../corporation/CorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';
import {IPlayer} from '../../IPlayer';
import {SelectPaymentDeferred} from '../../deferredActions/SelectPaymentDeferred';

import {newPrelude} from '../../createCard';
import {IPreludeCard} from '../prelude/IPreludeCard';
import {PreludesExpansion} from '../../preludes/PreludesExpansion';
export class GeneralAlliance extends ActiveCorporationCard {
  constructor() {
    super({
      name: CardName.GENERAL_ALLIANCE,
      tags: [Tag.EARTH],
      startingMegaCredits: 48,

      action: {},

      metadata: {
        cardNumber: 'EP-GEA',
        description: 'You start with 48 M€.',
        renderData: CardRenderer.builder((b) => {
          b.megacredits(48);
          b.corpBox('effect-action', (ce) => {
            ce.vSpace(Size.SMALL);
            ce.effect('In each research phase, also draw 2 preludes and keep them on this card.', (eb) => {
              eb.text('research', {size: Size.SMALL, uppercase: true}).startEffect.prelude().prelude();
            });
            ce.vSpace(Size.TINY);
            ce.action('Pay 18 M€ to play one of them.', (eb) => {
              eb.megacredits(18).startAction.prelude().asterix();
            });
          });
        }),
      },
    });
  }

  public static readonly COST = 18;

  /** Preludes drawn in research phases, waiting to be played. */
  public data: {preludes?: Array<CardName>} = {};

  public preludes(): Array<IPreludeCard> {
    return (this.data.preludes ?? []).map((name) => newPrelude(name)).filter((card) => card !== undefined);
  }

  public override bespokeCanAct(player: IPlayer) {
    return (this.data.preludes ?? []).length > 0 && player.canAfford(GeneralAlliance.COST);
  }

  public override bespokeAction(player: IPlayer) {
    player.game.defer(new SelectPaymentDeferred(player, GeneralAlliance.COST, {title: 'General Alliance: pay 18 M€ to play a prelude'}).andThen(() => {
      const select = PreludesExpansion.selectPreludeToPlay(player, this.preludes());
      const play = select.cb;
      select.cb = (cards) => {
        // Take the chosen prelude off this card, then play it as usual.
        const index = (this.data.preludes ?? []).indexOf(cards[0].name);
        if (index >= 0) {
          this.data.preludes?.splice(index, 1);
        }
        return play(cards);
      };
      player.defer(select);
    }));
    return undefined;
  }
}
