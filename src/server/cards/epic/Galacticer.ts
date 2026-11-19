import {CorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';
import {IPlayer} from '../../IPlayer';
import {ICard} from '../ICard';
import {Resource} from '../../../common/Resource';
import {all, digit} from '../Options';

export class Galacticer extends CorporationCard implements ICorporationCard {
  constructor() {
    super({
      name: CardName.GALACTICER,
      tags: [Tag.SPACE, Tag.GALACTIC],
      startingMegaCredits: 45,

      firstAction: {
        text: 'Reveal cards until you reveal one with a galactic tag, and take it',
        drawCard: {count: 1, tag: Tag.GALACTIC},
      },

      metadata: {
        cardNumber: 'EP-GAL',
        description: 'You start with 45 M€. First action: reveal cards until a galactic tag, and take it.',
        renderData: CardRenderer.builder((b) => {
          b.br.br;
          b.megacredits(45).cards(1, {secondaryTag: Tag.GALACTIC});
          b.corpBox('effect', (ce) => {
            ce.vSpace(Size.MEDIUM);
            ce.effect('When anyone plays a galactic tag, gain 10 M€ and draw 2 cards.', (eb) => {
              eb.tag(Tag.GALACTIC, {all}).startEffect.megacredits(10, {digit}).cards(2);
            });
          });
        }),
      },
    });
  }

  public onCardPlayedByAnyPlayer(thisCardOwner: IPlayer, card: ICard) {
    if (card === this) {
      return;
    }
    const count = thisCardOwner.tags.cardTagCount(card, Tag.GALACTIC);
    if (count > 0) {
      thisCardOwner.stock.add(Resource.MEGACREDITS, 10 * count, {log: true, from: {card: this}});
      thisCardOwner.drawCard(2 * count);
    }
  }
}
