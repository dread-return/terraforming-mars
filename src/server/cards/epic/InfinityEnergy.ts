import {CorporationCard} from '../corporation/CorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';

export class InfinityEnergy extends CorporationCard {
  constructor() {
    super({
      name: CardName.INFINITY_ENERGY,
      tags: [Tag.POWER],
      startingMegaCredits: 40,

      behavior: {
        production: {heat: 2},
      },

      metadata: {
        cardNumber: 'EP-INF',
        description: 'You start with 40 M€ and 2 heat production.',
        renderData: CardRenderer.builder((b) => {
          b.megacredits(40).production((pb) => pb.heat(2));
          b.corpBox('effect', (ce) => {
            ce.vSpace(Size.MEDIUM);
            ce.effect(undefined, (eb) => {
              eb.text('X').heat(1).startEffect.text('X').energy(1);
            });
            ce.vSpace(Size.TINY);
            ce.effect('You may use heat as energy, and energy as heat.', (eb) => {
              eb.text('X').energy(1).startEffect.text('X').heat(1);
            });
          });
        }),
      },
    });
  }
}
