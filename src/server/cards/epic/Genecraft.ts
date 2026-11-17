import {CorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {ICard} from '../ICard';
import {Resource} from '../../../common/Resource';
import {all} from '../Options';

export class Genecraft extends CorporationCard implements ICorporationCard {
  constructor() {
    super({
      name: CardName.GENECRAFT,
      tags: [Tag.MICROBE],
      startingMegaCredits: 30,
      cardDiscount: {tag: Tag.MICROBE, per: 'card', amount: 2},

      firstAction: {
        text: 'Reveal cards until you reveal one with a microbe tag, and take it',
        drawCard: {count: 1, tag: Tag.MICROBE},
      },

      metadata: {
        cardNumber: 'EP-GEN',
        description: 'You start with 30 M€. As your first action, reveal cards until you reveal a microbe tag. Take that card into hand and discard the rest.',
        renderData: CardRenderer.builder((b) => {
          b.megacredits(30).cards(1, {secondaryTag: Tag.MICROBE}).br;
          b.effect('When any player plays a microbe tag, increase your M€ production 1 step.', (eb) => {
            eb.tag(Tag.MICROBE, {all}).startEffect.production((pb) => pb.megacredits(1));
          }).br;
          b.effect('When you play a card with a microbe tag, you pay 2 M€ less for it.', (eb) => {
            eb.tag(Tag.MICROBE).startEffect.megacredits(-2);
          });
        }),
      },
    });
  }

  public onCardPlayedByAnyPlayer(thisCardOwner: IPlayer, card: ICard) {
    if (card === this) {
      return;
    }
    const count = thisCardOwner.tags.cardTagCount(card, Tag.MICROBE);
    if (count > 0) {
      thisCardOwner.production.add(Resource.MEGACREDITS, count, {log: true, from: {card: this}});
    }
  }
}
