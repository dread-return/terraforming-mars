import {CorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';
import {IPlayer} from '../../IPlayer';
import {ICard} from '../ICard';
import {Resource} from '../../../common/Resource';
import {all} from '../Options';

export class WeylandYutaniCorp extends CorporationCard implements ICorporationCard {
  constructor() {
    super({
      name: CardName.WEYLAND_YUTANI_CORP,
      tags: [Tag.SCIENCE],
      startingMegaCredits: 48,
      cardDiscount: {tag: Tag.SCIENCE, per: 'card', amount: 1},

      metadata: {
        cardNumber: 'EP-WYC',
        description: 'You start with 48 M€.',
        renderData: CardRenderer.builder((b) => {
          b.br.br;
          b.megacredits(48);
          b.corpBox('effect', (ce) => {
            ce.vSpace(Size.SMALL);
            ce.effect(undefined, (eb) => {
              eb.tag(Tag.SCIENCE, {all}).startEffect.megacredits(2);
            });
            ce.vSpace(Size.SMALL);
            ce.effect('When any science tag is played, gain 2 M€. Your science cards cost 1 M€ less.', (eb) => {
              eb.tag(Tag.SCIENCE).startEffect.megacredits(-1);
            });
          });
        }),
      },
    });
  }

  public onCardPlayedByAnyPlayer(thisCardOwner: IPlayer, card: ICard) {
    const count = thisCardOwner.tags.cardTagCount(card, Tag.SCIENCE);
    if (count > 0) {
      thisCardOwner.stock.add(Resource.MEGACREDITS, 2 * count, {log: true, from: {card: this}});
    }
  }
}
