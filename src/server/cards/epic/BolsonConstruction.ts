import {CorporationCard} from '../corporation/CorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';
import {TileType} from '../../../common/TileType';

export class BolsonConstruction extends CorporationCard {
  constructor() {
    super({
      name: CardName.BOLSON_CONSTRUCTION,
      tags: [Tag.BUILDING, Tag.BUILDING],
      startingMegaCredits: 48,

      behavior: {
        production: {steel: 2},
      },

      metadata: {
        cardNumber: 'EP-BOL',
        description: 'You start with 48 M€ and 2 steel production.',
        renderData: CardRenderer.builder((b) => {
          b.megacredits(48).production((pb) => pb.steel(2));
          b.corpBox('effect', (ce) => {
            ce.vSpace(Size.MEDIUM);
            ce.effect(undefined, (eb) => {
              eb.plate('City').startEffect.steel(1);
            });
            ce.vSpace(Size.TINY);
            ce.effect('Steel pays for the city standard project. Your cities may go on ocean tiles (they count as both).', (eb) => {
              eb.city({size: Size.SMALL}).startEffect.tile(TileType.OCEAN_CITY, false, false);
            });
          });
        }),
      },
    });
  }
}
