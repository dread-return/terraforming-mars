import {CorporationCard} from '../corporation/CorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';
import {digit} from '../Options';

export class S2AModular extends CorporationCard {
  constructor() {
    super({
      name: CardName.S2A_MODULAR,
      tags: [Tag.POWER, Tag.CITY],
      startingMegaCredits: 32,

      behavior: {
        production: {titanium: 1, energy: 3},
      },

      metadata: {
        cardNumber: 'EP-S2A',
        description: 'You start with 32 M€, 1 titanium production and 3 energy production.',
        renderData: CardRenderer.builder((b) => {
          b.megacredits(32).production((pb) => pb.titanium(1).energy(3, {digit}));
          b.corpBox('effect', (ce) => {
            ce.vSpace(Size.SMALL);
            ce.effect(undefined, (eb) => {
              eb.city({size: Size.SMALL}).city({size: Size.SMALL}).asterix().startEffect.text('OK', {size: Size.SMALL});
            });
            ce.vSpace(Size.TINY);
            ce.effect('*Your cities may go next to your own other cities, but not next to opponents\' cities. You can use titanium and energy to pay for the city standard project.', (eb) => {
              eb.plate('City').startEffect.titanium(1).energy(1);
            });
          });
        }),
      },
    });
  }
}
