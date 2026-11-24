import {CorporationCard} from '../corporation/CorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';
import {CardResource} from '../../../common/CardResource';

export class LeMartian extends CorporationCard {
  constructor() {
    super({
      name: CardName.LE_MARTIAN,
      tags: [Tag.BUILDING],
      startingMegaCredits: 42,

      behavior: {
        production: {plants: 2},
        stock: {plants: 2},
      },

      metadata: {
        cardNumber: 'EP-LEM',
        description: 'You start with 42 M€, 2 plant production and 2 plants.',
        renderData: CardRenderer.builder((b) => {
          b.megacredits(42).production((pb) => pb.plants(2)).plants(2);
          b.corpBox('effect', (ce) => {
            ce.vSpace(Size.MEDIUM);
            ce.effect(undefined, (eb) => {
              eb.text('X').plants(1).startEffect.megacredits(0, {text: '2x'});
            });
            ce.vSpace(Size.TINY);
            ce.effect('You may use plants as 2 M€ and animals from your cards as 3 M€, at any time.', (eb) => {
              eb.text('X').resource(CardResource.ANIMAL).startEffect.megacredits(0, {text: '3x'});
            });
          });
        }),
      },
    });
  }
}
