import {CorporationCard} from '../corporation/CorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';
import {all} from '../Options';

export class Amazonis extends CorporationCard {
  constructor() {
    super({
      name: CardName.AMAZONIS,
      tags: [Tag.EARTH, Tag.JOVIAN],
      startingMegaCredits: 46,

      behavior: {
        production: {megacredits: 2},
      },

      metadata: {
        cardNumber: 'EP-AMZ',
        description: 'You start with 46 M€ and 2 M€ production.',
        renderData: CardRenderer.builder((b) => {
          b.megacredits(46).production((pb) => pb.megacredits(2));
          b.corpBox('effect', (ce) => {
            ce.vSpace(Size.MEDIUM);
            ce.effect('On their turn, any player may buy basic resources for 3 M€ each (a free action). When an opponent buys, you get 2 M€ per resource.', (eb) => {
              eb.megacredits(3, {all}).asterix().startEffect.wild(1).nbsp.megacredits(2).asterix();
            });
          });
        }),
      },
    });
  }

  public static readonly PRICE = 3;
  public static readonly CUT = 2;
}
