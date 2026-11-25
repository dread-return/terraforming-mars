import {CorporationCard} from '../corporation/CorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';
import {CardResource} from '../../../common/CardResource';

export class UNVenusInitiative extends CorporationCard {
  constructor() {
    super({
      name: CardName.UN_VENUS_INITIATIVE,
      tags: [Tag.EARTH],
      startingMegaCredits: 40,
      resourceType: CardResource.VENUS_FUND,

      metadata: {
        cardNumber: 'EP-UNV',
        description: 'You start with 40 M€.',
        renderData: CardRenderer.builder((b) => {
          b.megacredits(40);
          b.corpBox('effect', (ce) => {
            ce.vSpace(Size.MEDIUM);
            ce.effect('Each production phase, put 5 M€ here as Venus funds.', (eb) => {
              eb.text('production', {size: Size.SMALL, uppercase: true}).startEffect.text('5', {size: Size.LARGE}).resource(CardResource.VENUS_FUND);
            });
            ce.vSpace(Size.TINY);
            ce.effect('Venus funds pay 1 M€ each, only for standard projects and cards that raise Venus.', (eb) => {
              eb.venus(1, {size: Size.SMALL}).slash().cards(1).venus(1, {size: Size.SMALL}).startEffect.resource(CardResource.VENUS_FUND).asterix();
            });
          });
        }),
      },
    });
  }
}
