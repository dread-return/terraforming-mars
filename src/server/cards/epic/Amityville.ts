import {CorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';
import {CardResource} from '../../../common/CardResource';
import {all} from '../Options';

export class Amityville extends CorporationCard implements ICorporationCard {
  constructor() {
    super({
      name: CardName.AMITYVILLE,
      tags: [Tag.PLANT],
      startingMegaCredits: 43,

      behavior: {
        production: {plants: 1},
      },

      metadata: {
        cardNumber: 'EP-AMV',
        description: 'You start with 43 M€ and 1 plant production.',
        renderData: CardRenderer.builder((b) => {
          b.br.br;
          b.megacredits(43).production((pb) => pb.plants(1));
          b.corpBox('effect', (ce) => {
            ce.vSpace(Size.MEDIUM);
            ce.effect('When you remove plants from other players, you may gain that many plants, or add that many radiation to another card.', (eb) => {
              eb.minus().plants(1, {all}).text('x').startEffect.plants(1).text('x').or().resource(CardResource.RADIATION).text('x');
            });
          });
        }),
      },
    });
  }
  // Effect is in EpicHooks.onStockChange.
}
