import {CorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';
import {all} from '../Options';

export class OrbitalEye extends CorporationCard implements ICorporationCard {
  constructor() {
    super({
      name: CardName.ORBITAL_EYE,
      tags: [Tag.SPACE, Tag.EARTH],
      startingMegaCredits: 33,

      behavior: {
        production: {megacredits: 2},
      },

      metadata: {
        cardNumber: 'EP-ORE',
        description: 'You start with 33 M€ and 2 M€ production.',
        renderData: CardRenderer.builder((b) => {
          b.br.br;
          b.megacredits(33).production((pb) => pb.megacredits(2));
          b.corpBox('effect', (ce) => {
            ce.vSpace(Size.MEDIUM);
            ce.effect('When a player removes or steals another player\'s resources or production, gain 3 of that resource.', (eb) => {
              eb.minus().wild(1, {all}).asterix().startEffect.wild(3);
            });
          });
        }),
      },
    });
  }
  // Effect is in EpicHooks.onReducedByAnotherPlayer / onCardResourceRemoved.
}
