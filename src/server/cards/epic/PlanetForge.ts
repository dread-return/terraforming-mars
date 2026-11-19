import {CorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';

export class PlanetForge extends CorporationCard implements ICorporationCard {
  constructor() {
    super({
      name: CardName.PLANET_FORGE,
      tags: [Tag.VENUS, Tag.BUILDING],
      startingMegaCredits: 41,

      behavior: {
        production: {steel: 2},
      },

      metadata: {
        cardNumber: 'EP-PFG',
        description: 'You start with 41 M€ and 2 steel production.',
        renderData: CardRenderer.builder((b) => {
          b.br.br;
          b.megacredits(41).production((pb) => pb.steel(2));
          b.corpBox('effect', (ce) => {
            ce.vSpace(Size.MEDIUM);
            ce.effect('You may use steel and titanium to pay for cards with a Venus tag.', (eb) => {
              eb.tag(Tag.VENUS).startEffect.steel(1).slash().titanium(1);
            });
          });
        }),
      },
    });
  }
  // Payment is in Player.paymentOptionsForCard (EpicHooks.canUseSteel / canUseTitanium).
}
