import {CorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';

export class DevWright extends CorporationCard implements ICorporationCard {
  constructor() {
    super({
      name: CardName.DEV_WRIGHT,
      tags: [Tag.SCIENCE],
      startingMegaCredits: 46,

      metadata: {
        cardNumber: 'EP-DVW',
        description: 'You start with 46 M€.',
        renderData: CardRenderer.builder((b) => {
          b.br.br;
          b.megacredits(46);
          b.corpBox('effect', (ce) => {
            ce.vSpace(Size.SMALL);
            ce.effect(undefined, (eb) => {
              eb.text('buy').cards(1).startEffect.megacredits(1);
            });
            ce.vSpace(Size.SMALL);
            ce.effect('Gain 1 M€ for each card you buy, and 2 M€ for each card you draw.', (eb) => {
              eb.text('draw').cards(1).startEffect.megacredits(2);
            });
          });
        }),
      },
    });
  }
  // Effect is in EpicHooks.onCardsKept.
}
