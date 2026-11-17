import {CorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';
import {all} from '../Options';

export class AcquireUnlimited extends CorporationCard implements ICorporationCard {
  constructor() {
    super({
      name: CardName.ACQUIRE_UNLIMITED,
      tags: [Tag.EARTH],
      startingMegaCredits: 42,

      metadata: {
        cardNumber: 'EP-AQU',
        description: 'You start with 42 M€.',
        renderData: CardRenderer.builder((b) => {
          b.br.br;
          b.megacredits(42);
          b.corpBox('effect', (ce) => {
            ce.vSpace(Size.SMALL);
            ce.effect(undefined, (eb) => {
              eb.production((pb) => pb.wild(2, {all})).startEffect.production((pb) => pb.wild(1));
            });
            ce.vSpace(Size.SMALL);
            ce.effect('When an opponent gains 2+ production (or 2+ resources) of one kind at once in the action phase, gain 1 of it.', (eb) => {
              eb.wild(2, {all}).startEffect.wild(1);
            });
          });
        }),
      },
    });
  }
  // Effect is in EpicHooks.onProductionChange / onStockChange.
}
