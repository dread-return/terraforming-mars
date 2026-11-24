import {CorporationCard} from '../corporation/CorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';
import {IPlayer} from '../../IPlayer';
import {Resource} from '../../../common/Resource';
import {Space} from '../../boards/Space';
import {Board} from '../../boards/Board';
import {BoardType} from '../../boards/BoardType';
import {sum} from '../../../common/utils/utils';
import {TileType} from '../../../common/TileType';
import * as VP from '../render/DynamicVictoryPoints';

export class Atlantis extends CorporationCard {
  constructor() {
    super({
      name: CardName.ATLANTIS,
      tags: [Tag.SCIENCE],
      startingMegaCredits: 40,
      victoryPoints: 'special',
      firstAction: {
        text: 'Place an ocean tile',
        ocean: {},
      },

      metadata: {
        cardNumber: 'EP-ATL',
        description: 'You start with 40 M€. First action: place an ocean. Your cities on oceans score adjacent oceans instead of greeneries.',
        renderData: CardRenderer.builder((b) => {
          b.megacredits(40).oceans(1);
          b.corpBox('effect', (ce) => {
            ce.vSpace(Size.SMALL);
            ce.effect(undefined, (eb) => {
              eb.city({size: Size.SMALL}).asterix().startEffect.tile(TileType.OCEAN_CITY, false, false);
            });
            ce.vSpace(Size.TINY);
            ce.effect('Your cities may go on oceans (they count as both). An ocean next to one: +2 M€.', (eb) => {
              eb.oceans(1, {size: Size.SMALL}).asterix().startEffect.megacredits(2);
            });
          });
        }),
        victoryPoints: VP.oceans(1, 1),
      },
    });
  }

  /** An ocean placed next to your cities on oceans: 2 M€ each. */
  public onTilePlaced(cardOwner: IPlayer, _activePlayer: IPlayer, space: Space, boardType: BoardType) {
    if (boardType !== BoardType.MARS || space.tile?.tileType !== TileType.OCEAN) {
      return;
    }
    const board = cardOwner.game.board;
    const cities = board.getAdjacentSpaces(space).filter((s) => s.tile?.tileType === TileType.OCEAN_CITY && s.player?.id === cardOwner.id);
    if (cities.length > 0) {
      cardOwner.stock.add(Resource.MEGACREDITS, 2 * cities.length, {log: true, from: {card: this}});
    }
  }

  /** Your cities on oceans score adjacent oceans instead of greeneries. */
  public override getVictoryPoints(player: IPlayer): number {
    const board = player.game.board;
    return sum(board.getCities(player).filter((city) => city.tile?.tileType === TileType.OCEAN_CITY).map((city) => {
      const adjacent = board.getAdjacentSpaces(city);
      return adjacent.filter((s) => Board.isOceanSpace(s)).length - adjacent.filter((s) => Board.isGreenerySpace(s)).length;
    }));
  }
}
