import {CorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';

export class Thermex extends CorporationCard implements ICorporationCard {
  constructor() {
    super({
      name: CardName.THERMEX,
      tags: [Tag.POWER, Tag.BUILDING],
      startingMegaCredits: 38,

      behavior: {
        production: {energy: 1, heat: 1},
      },

      metadata: {
        cardNumber: 'EP-THX',
        description: 'You start with 38 M€, 1 energy production and 1 heat production.',
        renderData: CardRenderer.builder((b) => {
          b.br.br;
          b.megacredits(38).production((pb) => pb.energy(1).heat(1));
          b.corpBox('effect', (ce) => {
            ce.vSpace(Size.MEDIUM);
            ce.effect('When your energy production decreases, raise your heat production as many steps.', (eb) => {
              eb.production((pb) => pb.minus().energy(1)).startEffect.production((pb) => pb.heat(1));
            });
          });
        }),
      },
    });
  }
  // Effect is in EpicHooks.onProductionChange.
}
