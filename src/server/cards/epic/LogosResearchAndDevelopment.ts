import {CorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';

export class LogosResearchAndDevelopment extends CorporationCard implements ICorporationCard {
  constructor() {
    super({
      name: CardName.LOGOS_RESEARCH_AND_DEVELOPMENT,
      tags: [Tag.SCIENCE],
      startingMegaCredits: 37,

      firstAction: {
        text: 'Draw 2 cards',
        drawCard: 2,
      },

      metadata: {
        cardNumber: 'EP-LRD',
        description: 'You start with 37 M€. First action: draw 2 cards.',
        renderData: CardRenderer.builder((b) => {
          b.br.br;
          b.megacredits(37).cards(2);
          b.corpBox('effect', (ce) => {
            ce.vSpace(Size.MEDIUM);
            ce.effect('In the research phase, look at 5 cards. 1 card you keep is free.', (eb) => {
              eb.plate('Research').startEffect.text('5').cards(1).text('1 free', {size: Size.SMALL});
            });
          });
        }),
      },
    });
  }
  // Effect is in EpicHooks.extraResearchCards / freeResearchCards.
}
