import {ActiveCorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {ICard} from '../ICard';

export class UnderSec extends ActiveCorporationCard implements ICorporationCard {
  constructor() {
    super({
      name: CardName.UNDERSEC,
      tags: [Tag.SCIENCE],
      startingMegaCredits: 46,
      action: {
        drawCard: 1,
      },

      metadata: {
        cardNumber: 'EP-UND',
        description: 'You start with 46 M€.',
        renderData: CardRenderer.builder((b) => {
          b.megacredits(46).br;
          b.effect('Each time you play a science tag, including this, look at the top card and either buy it or discard it.', (eb) => {
            eb.tag(Tag.SCIENCE).startEffect.cards(1).asterix();
          }).br;
          b.action('Draw a card.', (eb) => {
            eb.empty().startAction.cards(1);
          });
        }),
      },
    });
  }

  public onCardPlayed(player: IPlayer, card: ICard) {
    const count = player.tags.cardTagCount(card, Tag.SCIENCE);
    for (let i = 0; i < count; i++) {
      player.drawCardKeepSome(1, {paying: true, keepMax: 1});
    }
  }
}
