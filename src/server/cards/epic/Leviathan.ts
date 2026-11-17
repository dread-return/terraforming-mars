import {CorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';

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
          b.br.br;
          b.megacredits(60);
          b.corpBox('effect', (ce) => {
            ce.vSpace(Size.MEDIUM);
            ce.effect('During the research phase, you look at and may buy one more card.', (eb) => {
              eb.plate('Research').startEffect.plus().cards(1);
            });
          });
        }),
      },
    });
  }
}
