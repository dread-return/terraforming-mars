import {CorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';

export class CheapChispa extends CorporationCard implements ICorporationCard {
  constructor() {
    super({
      name: CardName.CHEAP_CHISPA,
      tags: [Tag.POWER],
      startingMegaCredits: 48,

      behavior: {
        production: {megacredits: -2},
      },

      metadata: {
        cardNumber: 'EP-CCH',
        description: 'You start with 48 M€ and -2 M€ production.',
        renderData: CardRenderer.builder((b) => {
          b.br.br;
          b.megacredits(48).production((pb) => pb.megacredits(-2));
          b.corpBox('effect', (ce) => {
            ce.vSpace(Size.MEDIUM);
            ce.effect('Whenever your energy production decreases, decrease it 1 step less (e.g. -2 becomes -1).', (eb) => {
              eb.production((pb) => pb.minus().energy(2)).startEffect.production((pb) => pb.minus().energy(1));
            });
          });
        }),
      },
    });
  }
  // Effect is in EpicHooks.adjustProductionChange and Production.canAdjust.
}
