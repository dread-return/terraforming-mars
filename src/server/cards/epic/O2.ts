import {CorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';
import {IPlayer} from '../../IPlayer';
import {ICard} from '../ICard';
import {CardType} from '../../../common/cards/CardType';
import {Resource} from '../../../common/Resource';
import {all} from '../Options';

export class O2 extends CorporationCard implements ICorporationCard {
  constructor() {
    super({
      name: CardName.O2,
      tags: [Tag.SCIENCE],
      startingMegaCredits: 39,

      metadata: {
        cardNumber: 'EP-O2',
        description: 'You start with 39 M€.',
        renderData: CardRenderer.builder((b) => {
          b.br.br;
          b.megacredits(39);
          b.corpBox('effect', (ce) => {
            ce.vSpace(Size.SMALL);
            ce.effect(undefined, (eb) => {
              eb.tag(Tag.BUILDING, {all}).text('max 7%', {size: Size.SMALL}).startEffect.megacredits(1);
            });
            ce.vSpace(Size.SMALL);
            ce.effect('Any building tag while oxygen is 7% or less: gain 1 M€. Any non-event space tag: gain 1 M€.', (eb) => {
              eb.tag(Tag.SPACE, {all}).asterix().startEffect.megacredits(1);
            });
          });
        }),
      },
    });
  }

  public onCardPlayedByAnyPlayer(thisCardOwner: IPlayer, card: ICard) {
    let gain = 0;
    if (thisCardOwner.game.getOxygenLevel() <= 7) {
      gain += thisCardOwner.tags.cardTagCount(card, Tag.BUILDING);
    }
    if (card.type !== CardType.EVENT) {
      gain += thisCardOwner.tags.cardTagCount(card, Tag.SPACE);
    }
    if (gain > 0) {
      thisCardOwner.stock.add(Resource.MEGACREDITS, gain, {log: true, from: {card: this}});
    }
  }
}
