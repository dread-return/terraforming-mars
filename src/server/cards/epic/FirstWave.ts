import {CorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';
import {digit} from '../Options';

export class FirstWave extends CorporationCard implements ICorporationCard {
  constructor() {
    super({
      name: CardName.FIRST_WAVE,
      tags: [Tag.CITY, Tag.MARS],
      startingMegaCredits: 10,

      behavior: {
        tr: 1,
        production: {megacredits: 1, steel: 1, titanium: 1, plants: 1, energy: 1, heat: 1},
      },

      firstAction: {
        text: 'Place a city tile',
        city: {},
      },

      metadata: {
        cardNumber: 'EP-FWV',
        description: 'You start with 10 M€, +1 TR and 1 production of each kind. First action: city.',
        renderData: CardRenderer.builder((b) => {
          b.megacredits(10).tr(1).production((pb) => pb.wild(1)).text('x6');
          b.corpBox('effect', (ce) => {
            ce.vSpace(Size.SMALL);
            ce.effect('You do not pay for the first 4 cards you keep during setup.', (eb) => {
              eb.text('setup').cards(4, {digit}).startEffect.megacredits(0);
            });
          });
        }),
      },
    });
  }
  // The free setup cards are in Player.playCorporationCard (EpicHooks.freeSetupCards).
}
