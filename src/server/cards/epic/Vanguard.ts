import {CorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';

export class Vanguard extends CorporationCard implements ICorporationCard {
  constructor() {
    super({
      name: CardName.VANGUARD,
      tags: [Tag.VENUS],
      startingMegaCredits: 53,

      behavior: {
        production: {steel: 1},
      },

      metadata: {
        cardNumber: 'EP-VAN',
        description: 'You start with 53 M€ and 1 steel production.',
        renderData: CardRenderer.builder((b) => {
          b.br.br;
          b.megacredits(53).production((pb) => pb.steel(1));
          b.corpBox('effect', (ce) => {
            ce.vSpace(Size.MEDIUM);
            ce.effect('Steel may be used as 3 M€ each when paying for cards with Venus tags.', (eb) => {
              eb.tag(Tag.VENUS).startEffect.steel(1).text('=').megacredits(3);
            });
          });
        }),
      },
    });
  }
  // Payment is in Player.paymentOptionsForCard (EpicHooks.canUseSteel / steelValueForCard).
}
