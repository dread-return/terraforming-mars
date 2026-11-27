import {ActiveCorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';

export class Vanguard extends ActiveCorporationCard implements ICorporationCard {
  constructor() {
    super({
      name: CardName.VANGUARD,
      tags: [Tag.VENUS, Tag.BUILDING],
      startingMegaCredits: 53,

      behavior: {
        production: {steel: 1},
      },

      action: {
        spend: {steel: 3},
        drawCard: {count: 1, tag: Tag.VENUS},
      },

      metadata: {
        cardNumber: 'EP-VAN',
        description: 'You start with 53 M€ and 1 steel production.',
        renderData: CardRenderer.builder((b) => {
          b.br;
          b.megacredits(53).production((pb) => pb.steel(1));
          b.br;
          b.effect('Steel may pay for Venus cards.', (eb) => {
            eb.tag(Tag.VENUS).startEffect.steel(1);
          }).br;
          b.action('3 steel: reveal cards until a Venus tag; take it.', (eb) => {
            eb.steel(3).startAction.cards(1, {secondaryTag: Tag.VENUS});
          }).br;
        }),
      },
    });
  }
  // Payment is in Player.paymentOptionsForCard (EpicHooks.canUseSteel).
}
