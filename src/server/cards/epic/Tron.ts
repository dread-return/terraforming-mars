import {CorporationCard} from '../corporation/CorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';
import {CardResource} from '../../../common/CardResource';
import {all} from '../Options';

export class Tron extends CorporationCard {
  constructor() {
    super({
      name: CardName.TRON,
      tags: [Tag.EARTH, Tag.SCIENCE],
      startingMegaCredits: 25,
      resourceType: CardResource.ADMINISTRATION,

      behavior: {
        drawCard: 3,
      },

      metadata: {
        cardNumber: 'EP-TRN',
        description: 'You start with 25 M€ and draw 3 cards.',
        renderData: CardRenderer.builder((b) => {
          b.megacredits(25).cards(3);
          b.corpBox('effect', (ce) => {
            ce.vSpace(Size.LARGE);
            ce.effect('After you pass, each action another player takes adds an administration resource here, unless they pay you 1 M€ instead.', (eb) => {
              eb.text('passed', {size: Size.SMALL, uppercase: true}).asterix().startEffect.resource(CardResource.ADMINISTRATION).slash().megacredits(1, {all});
            });
            ce.effect('Administration resources may be used as 2 M€ each, or as plants when converting plants into a greenery.', (eb) => {
              eb.resource(CardResource.ADMINISTRATION).startEffect.megacredits(2).slash().plants(1).asterix();
            });
          });
        }),
      },
    });
  }
}
