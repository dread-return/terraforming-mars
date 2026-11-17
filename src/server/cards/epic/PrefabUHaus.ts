import {CorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';
import {digit} from '../Options';

export class PrefabUHaus extends CorporationCard implements ICorporationCard {
  constructor() {
    super({
      name: CardName.PREFAB_U_HAUS,
      tags: [Tag.BUILDING],
      startingMegaCredits: 52,

      behavior: {
        production: {steel: 1},
      },

      metadata: {
        cardNumber: 'EP-PUH',
        description: 'You start with 52 M€ and 1 steel production.',
        renderData: CardRenderer.builder((b) => {
          b.br.br;
          b.megacredits(52).production((pb) => pb.steel(1));
          b.corpBox('effect', (ce) => {
            ce.vSpace(Size.MEDIUM);
            ce.effect('At any time (no action needed), you may pay 8 steel to place a city.', (eb) => {
              eb.steel(8, {digit}).text('∞').startEffect.city();
            });
          });
        }),
      },
    });
  }
  // The conversion is in EpicHooks.freeActionOption.
}
