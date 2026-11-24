import {CorporationCard} from '../corporation/CorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';
import {IPlayer} from '../../IPlayer';
import {Resource} from '../../../common/Resource';
import {Space} from '../../boards/Space';
import {TileType} from '../../../common/TileType';
import {digit} from '../Options';

export class Babylonia extends CorporationCard {
  constructor() {
    super({
      name: CardName.BABYLONIA,
      tags: [Tag.MARS, Tag.PLANT],
      startingMegaCredits: 44,

      behavior: {
        stock: {plants: 4},
      },

      metadata: {
        cardNumber: 'EP-BAB',
        description: 'You start with 44 M€ and 4 plants.',
        renderData: CardRenderer.builder((b) => {
          b.megacredits(44).plants(4, {digit});
          b.corpBox('effect', (ce) => {
            ce.vSpace(Size.MEDIUM);
            ce.effect('Your greeneries may go on ocean tiles (normal greenery rules apply): +2 M€. It counts as both a greenery and an ocean.', (eb) => {
              eb.greenery({size: Size.SMALL}).startEffect.tile(TileType.OCEAN_GREENERY, false, false).megacredits(2);
            });
          });
        }),
      },
    });
  }

  public onTilePlaced(cardOwner: IPlayer, activePlayer: IPlayer, space: Space) {
    if (cardOwner === activePlayer && space.tile?.tileType === TileType.OCEAN_GREENERY) {
      cardOwner.stock.add(Resource.MEGACREDITS, 2, {log: true, from: {card: this}});
    }
  }
}
