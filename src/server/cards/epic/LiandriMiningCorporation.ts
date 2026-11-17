import {CorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';

export class LiandriMiningCorporation extends CorporationCard implements ICorporationCard {
  constructor() {
    super({
      name: CardName.LIANDRI_MINING_CORPORATION,
      tags: [Tag.POWER, Tag.BUILDING],
      startingMegaCredits: 43,
      behavior: {
        production: {energy: 1, steel: 1},
        steelValue: 1,
      },

      metadata: {
        cardNumber: 'EP-LMC',
        description: 'You start with 43 M€, 1 energy production and 1 steel production.',
        renderData: CardRenderer.builder((b) => {
          b.megacredits(43).production((pb) => pb.energy(1).steel(1)).br;
          b.effect('Your steel resources are each worth 1 M€ extra.', (eb) => {
            eb.steel(1).startEffect.plus().megacredits(1);
          });
        }),
      },
    });
  }
}
