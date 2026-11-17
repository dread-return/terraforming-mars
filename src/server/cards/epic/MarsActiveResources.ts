import {CorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {AltSecondaryTag} from '../../../common/cards/render/AltSecondaryTag';
import {Size} from '../../../common/cards/render/Size';
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
        description: 'You start with 39 M€. First action: reveal cards until a blue card, and take it.',
        renderData: CardRenderer.builder((b) => {
          b.br;
          b.megacredits(39).cards(1, {secondaryTag: AltSecondaryTag.BLUE});
          b.corpBox('effect', (ce) => {
            ce.vSpace(Size.SMALL);
            ce.effect(undefined, (eb) => {
              eb.cards(1, {secondaryTag: AltSecondaryTag.BLUE}).startEffect.megacredits(2);
            });
            ce.vSpace(Size.SMALL);
            ce.effect('Play a blue card: gain 2 M€. Use a blue card action: gain 1 M€.', (eb) => {
              eb.text('blue action', {size: Size.SMALL}).startEffect.megacredits(1);
            });
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
