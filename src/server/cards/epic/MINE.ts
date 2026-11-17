import {CorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';
import {all} from '../Options';
import {digit} from '../Options';

export class MINE extends CorporationCard implements ICorporationCard {
  constructor() {
    super({
      name: CardName.MINE_EPIC,
      tags: [Tag.BUILDING],
      startingMegaCredits: 23,

      behavior: {
        stock: {steel: 5, titanium: 5},
      },

      metadata: {
        cardNumber: 'EP-MNE',
        description: 'You start with 23 M€, 5 steel and 5 titanium.',
        renderData: CardRenderer.builder((b) => {
          b.br.br;
          b.megacredits(23).steel(5, {digit}).titanium(5, {digit});
          b.corpBox('effect', (ce) => {
            ce.vSpace(Size.MEDIUM);
            ce.effect('When any player raises their steel production, you may raise their M€ production and your titanium production 1 step.', (eb) => {
              eb.production((pb) => pb.steel(1, {all})).startEffect.production((pb) => pb.megacredits(1, {all})).production((pb) => pb.titanium(1)).asterix();
            });
          });
        }),
      },
    });
  }
  // Effect is in EpicHooks.onProductionChange.
}
