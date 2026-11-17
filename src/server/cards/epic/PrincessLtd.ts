import {CorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';

export class PrincessLtd extends CorporationCard implements ICorporationCard {
  constructor() {
    super({
      name: CardName.PRINCESS_LTD,
      tags: [Tag.EARTH],
      startingMegaCredits: 48,

      behavior: {
        production: {megacredits: 3},
      },

      metadata: {
        cardNumber: 'EP-PRL',
        description: 'You start with 48 M€ and 3 M€ production.',
        renderData: CardRenderer.builder((b) => {
          b.br.br;
          b.megacredits(48).production((pb) => pb.megacredits(3));
          b.corpBox('effect', (ce) => {
            ce.vSpace(Size.MEDIUM);
            ce.effect('Once per generation, when you lose production of another type, you may lose M€ production instead.', (eb) => {
              eb.production((pb) => pb.minus().wild(1)).startEffect.production((pb) => pb.minus().megacredits(1)).asterix();
            });
          });
        }),
      },
    });
  }
  // Effect is in EpicHooks.onProductionChange.
}
