import {CorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {ICard} from '../ICard';
import {CardType} from '../../../common/cards/CardType';
import {Resource} from '../../../common/Resource';

/** The "use a blue card action" half is in EpicHooks.onCardAction. */
export class MarsActiveResources extends CorporationCard implements ICorporationCard {
  constructor() {
    super({
      name: CardName.MARS_ACTIVE_RESOURCES,
      tags: [Tag.MARS],
      startingMegaCredits: 39,

      firstAction: {
        text: 'Reveal cards until you reveal an active (blue) card, and take it',
        drawCard: {count: 1, type: CardType.ACTIVE},
      },

      metadata: {
        cardNumber: 'EP-MAR',
        description: 'You start with 39 M€. As your first action, reveal cards until you reveal an active (blue) card. Take it into hand and discard the rest.',
        renderData: CardRenderer.builder((b) => {
          b.megacredits(39).cards(1).asterix().br;
          b.effect('Every time you play an active (blue) card, collect 2 M€. Every time you perform an action on an active (blue) card, collect 1 M€.', (eb) => {
            eb.text('blue card').colon().megacredits(2).nbsp.text('blue action').startEffect.megacredits(1);
          });
        }),
      },
    });
  }

  public onCardPlayed(player: IPlayer, card: ICard) {
    if (card.type === CardType.ACTIVE) {
      player.stock.add(Resource.MEGACREDITS, 2, {log: true, from: {card: this}});
    }
  }
}
