import {CorporationCard} from '../corporation/CorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';
import {IPlayer} from '../../IPlayer';
import {Resource} from '../../../common/Resource';
import {CardResource} from '../../../common/CardResource';
import {Space} from '../../boards/Space';
import {TileType} from '../../../common/TileType';

export class Primal extends CorporationCard {
  constructor() {
    super({
      name: CardName.PRIMAL,
      tags: [Tag.PLANT, Tag.ANIMAL],
      startingMegaCredits: 45,
      resourceType: CardResource.ANIMAL,
      victoryPoints: {resourcesHere: {}, per: 2},

      metadata: {
        cardNumber: 'EP-PRM',
        description: 'You start with 45 M€. 1 VP per 2 animals here.',
        renderData: CardRenderer.builder((b) => {
          b.megacredits(45);
          b.corpBox('effect', (ce) => {
            ce.vSpace(Size.LARGE);
            ce.effect('You may place wildernesses on other players\' greeneries. They keep the tile.', (eb) => {
              eb.tile(TileType.WILDERNESS, false).startEffect.greenery({size: Size.SMALL, withO2: false, any: true}).asterix();
            });
            ce.effect('Each wilderness you place: 5 M€.', (eb) => {
              eb.tile(TileType.WILDERNESS, false).startEffect.megacredits(5);
            });
          });
        }),
      },
    });
  }

  public onTilePlaced(cardOwner: IPlayer, activePlayer: IPlayer, space: Space) {
    // A wilderness upgrade fires onTilePlaced once, for the greenery it covers.
    if (cardOwner === activePlayer && space.tile?.upgrade === 'wilderness') {
      cardOwner.stock.add(Resource.MEGACREDITS, 5, {log: true, from: {card: this}});
    }
  }
}
