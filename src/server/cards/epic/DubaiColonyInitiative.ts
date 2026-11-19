import {CorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';
import {IPlayer} from '../../IPlayer';
import {Resource} from '../../../common/Resource';
import {Space} from '../../boards/Space';
import {Board} from '../../boards/Board';
import {BoardType} from '../../boards/BoardType';
import {PlaceCityTile} from '../../deferredActions/PlaceCityTile';
import {digit} from '../Options';

export class DubaiColonyInitiative extends CorporationCard implements ICorporationCard {
  constructor() {
    super({
      name: CardName.DUBAI_COLONY_INITIATIVE,
      tags: [Tag.BUILDING],
      startingMegaCredits: 36,

      behavior: {
        stock: {steel: 10},
      },

      metadata: {
        cardNumber: 'EP-DCI',
        description: 'You start with 36 M€ and 10 steel.',
        renderData: CardRenderer.builder((b) => {
          b.br.br;
          b.megacredits(36).steel(10, {digit});
          b.corpBox('effect', (ce) => {
            ce.vSpace(Size.MEDIUM);
            ce.effect('When your greenery leaves a city with exactly 3 adjacent greeneries, +1 M€ production and place a city next to that city.', (eb) => {
              eb.greenery({size: Size.SMALL}).text('3', {size: Size.SMALL}).city({size: Size.SMALL}).startEffect.production((pb) => pb.megacredits(1)).city({size: Size.SMALL});
            });
          });
        }),
      },
    });
  }

  public onTilePlaced(cardOwner: IPlayer, activePlayer: IPlayer, space: Space, boardType: BoardType) {
    if (cardOwner !== activePlayer || boardType !== BoardType.MARS || !Board.isGreenerySpace(space)) {
      return;
    }
    const board = cardOwner.game.board;
    for (const city of board.getAdjacentSpaces(space).filter((s) => Board.isCitySpace(s))) {
      if (board.getAdjacentSpaces(city).filter((s) => Board.isGreenerySpace(s)).length !== 3) {
        continue;
      }
      cardOwner.production.add(Resource.MEGACREDITS, 1, {log: true, from: {card: this}});
      const neighbours = board.getAdjacentSpaces(city);
      const spaces = board.getAvailableSpacesOnLand(cardOwner).filter((s) => neighbours.includes(s));
      if (spaces.length > 0) {
        cardOwner.game.defer(new PlaceCityTile(cardOwner, {spaces, title: 'Dubai Colony Initiative: place a city next to that city'}));
      }
    }
  }
}
