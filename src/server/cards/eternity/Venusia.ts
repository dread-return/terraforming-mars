import {ActiveCorporationCard} from '../corporation/CorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {Tag} from '../../../common/cards/Tag';

export class Venusia extends ActiveCorporationCard implements ICorporationCard {
  constructor() {
    super({
      name: CardName.VENUSIA,
      tags: [Tag.VENUS],
      startingMegaCredits: 47,
      victoryPoints: -1,
      behavior: {
        production: {megacredits: -1, heat: 2},
        tr: -2,
        drawCard: 2,
      },
      action: {
        global: {venus: 1},
      },
      metadata: {
        cardNumber: 'EC23',
        renderData: CardRenderer.builder((b) => {
          b.megacredits(47).production((pb) => pb.megacredits(-1).heat(2)).br;
          b.corpBox('effect-action', (ce) => {
            ce.effect('Heat is worth 2 M€ for standard projects.', (eb) => eb.text('SP').startEffect.heat(1).equals().megacredits(2));
            ce.action('Raise Venus 1 step.', (eb) => eb.empty().startAction.venus(1));
          });
        }),
        description: 'You start with 47 M\u20ac and -2 TR. Draw 2 cards.',
      },
    });
  }
}
