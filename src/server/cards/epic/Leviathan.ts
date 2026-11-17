import {CorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';

/** The extra research card is in Draft.ts (EpicHooks.extraResearchCards). */
export class Leviathan extends CorporationCard implements ICorporationCard {
  constructor() {
    super({
      name: CardName.LEVIATHAN,
      tags: [Tag.SPACE],
      startingMegaCredits: 60,

      metadata: {
        cardNumber: 'EP-LEV',
        description: 'You start with 60 M€.',
        renderData: CardRenderer.builder((b) => {
          b.megacredits(60).br;
          b.effect('During your research phase, you may look at and buy one additional card.', (eb) => {
            eb.text('Research').startEffect.plus().cards(1);
          });
        }),
      },
    });
  }
}
