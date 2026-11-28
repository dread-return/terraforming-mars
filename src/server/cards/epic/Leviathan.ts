import {CorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';

/** Free space cards in research: EpicHooks.cardBuyCost. */
export class Leviathan extends CorporationCard implements ICorporationCard {
  constructor() {
    super({
      name: CardName.LEVIATHAN,
      tags: [Tag.SPACE],
      startingMegaCredits: 40,
      behavior: {
        production: {titanium: 1},
      },

      metadata: {
        cardNumber: 'EP-LEV',
        description: 'You start with 40 M€ and 1 titanium production.',
        renderData: CardRenderer.builder((b) => {
          b.br.br;
          b.megacredits(40).production((pb) => pb.titanium(1));
          b.corpBox('effect', (ce) => {
            ce.vSpace(Size.MEDIUM);
            ce.effect('During research, you buy cards with a space tag for free.', (eb) => {
              eb.plate('Research').cards(1, {secondaryTag: Tag.SPACE}).startEffect.text('free', {size: Size.SMALL});
            });
          });
        }),
      },
    });
  }
}
