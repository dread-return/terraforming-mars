import {digit} from '../Options';
import * as VP from '../render/DynamicVictoryPoints';
import {ActiveCorporationCard} from '../corporation/CorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';
import {IPlayer} from '../../IPlayer';
import {Resource} from '../../../common/Resource';
import {CardResource} from '../../../common/CardResource';
import {Space} from '../../boards/Space';
import {Board} from '../../boards/Board';
import {TileType} from '../../../common/TileType';
import {SelectSpace} from '../../inputs/SelectSpace';

export class FoundingFarmers extends ActiveCorporationCard {
  constructor() {
    super({
      name: CardName.FOUNDING_FARMERS,
      tags: [Tag.PLANT],
      startingMegaCredits: 42,
      resourceType: CardResource.FARM,
      victoryPoints: 'special',

      behavior: {
        stock: {plants: 3},
        production: {plants: 1},
        addResources: 3,
      },

      action: {},

      metadata: {
        cardNumber: 'EP-FFM',
        description: 'You start with 42 M€, 3 plants, 1 plant production and 3 farms.',
        renderData: CardRenderer.builder((b) => {
          b.megacredits(42).plants(3, {digit}).production((pb) => pb.plants(1)).resource(CardResource.FARM, {amount: 3, digit});
          b.corpBox('action', (ce) => {
            ce.vSpace(Size.SMALL);
            ce.action('Spend 6 plants: place a farm from here anywhere on Mars, +1 oxygen. Each farm: 1 VP, plus 1 VP per adjacent city.', (eb) => {
              eb.plants(6).startAction.tile(TileType.FARM).asterix().oxygen(1);
            });
          });
        }),
        victoryPoints: {...VP.resource(CardResource.FARM, 1, 1), asterisk: true},
      },
    });
  }

  private spaces(player: IPlayer): ReadonlyArray<Space> {
    return player.game.board.getAvailableSpacesOnLand(player);
  }

  public override bespokeCanAct(player: IPlayer) {
    return this.resourceCount > 0 && player.plants >= 6 && this.spaces(player).length > 0;
  }

  public override bespokeAction(player: IPlayer) {
    return new SelectSpace('Select space for a farm tile', this.spaces(player)).andThen((space) => {
      player.stock.deduct(Resource.PLANTS, 6, {log: true});
      player.removeResourceFrom(this, 1, {log: false});
      player.game.addTile(player, space, {tileType: TileType.FARM, card: this.name});
      player.game.increaseOxygenLevel(player, 1);
      return undefined;
    });
  }

  public override getVictoryPoints(player: IPlayer): number {
    const board = player.game.board;
    let points = 0;
    for (const space of board.spaces) {
      if (space.tile?.tileType === TileType.FARM && space.player?.id === player.id) {
        points += 1 + board.getAdjacentSpaces(space).filter(Board.isCitySpace).length;
      }
    }
    return points;
  }
}
