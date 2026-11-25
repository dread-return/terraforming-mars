import {ActiveCorporationCard} from '../corporation/CorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {CardResource} from '../../../common/CardResource';
import {Space} from '../../boards/Space';
import {Board} from '../../boards/Board';
import {SpaceType} from '../../../common/boards/SpaceType';
import {OrOptions} from '../../inputs/OrOptions';
import {SelectOption} from '../../inputs/SelectOption';
import {SelectPaymentDeferred} from '../../deferredActions/SelectPaymentDeferred';
import {SelectSpace} from '../../inputs/SelectSpace';
import * as VP from '../render/DynamicVictoryPoints';

import {TileType} from '../../../common/TileType';
export class Tholus extends ActiveCorporationCard {
  constructor() {
    super({
      name: CardName.THOLUS,
      tags: [Tag.BUILDING, Tag.CITY],
      startingMegaCredits: 40,
      resourceType: CardResource.FRAME,
      victoryPoints: 'special',

      behavior: {
        production: {steel: 1},
      },

      action: {},

      metadata: {
        cardNumber: 'EP-THL',
        description: 'You start with 40 M€ and 1 steel production.',
        renderData: CardRenderer.builder((b) => {
          b.megacredits(40).production((pb) => pb.steel(1)).br;
          b.effect('Each steel production step gained or lost (incl. this): add or remove a frame.', (eb) => {
            eb.production((pb) => pb.steel(1)).startEffect.resource(CardResource.FRAME);
          }).br;
          b.action('Metropolis: 2 VP per adjacent greenery.', (eb) => {
            eb.megacredits(10).resource(CardResource.FRAME, 2).startAction.city().text('→').tile(TileType.THOLUS_METROPOLIS, false);
          }).br;
          b.action('Megalopolis: 3 VP per adjacent greenery.', (eb) => {
            eb.or().megacredits(15).resource(CardResource.FRAME, 3).startAction.tile(TileType.THOLUS_METROPOLIS, false).text('→').tile(TileType.THOLUS_MEGALOPOLIS, false);
          });
        }),
        victoryPoints: VP.greeneries(1, true),
      },
    });
  }

  public static readonly METROPOLIS_COST = 10;
  public static readonly MEGALOPOLIS_COST = 15;

  private static ownTiles(player: IPlayer, tileType: TileType): ReadonlyArray<Space> {
    return player.game.board.spaces.filter((space) =>
      space.tile?.tileType === tileType && space.player === player && space.spaceType !== SpaceType.COLONY);
  }

  private canMetropolis(player: IPlayer) {
    return this.resourceCount >= 2 && player.canAfford(Tholus.METROPOLIS_COST) && Tholus.ownTiles(player, TileType.CITY).length > 0;
  }

  private canMegalopolis(player: IPlayer) {
    return this.resourceCount >= 3 && player.canAfford(Tholus.MEGALOPOLIS_COST) && Tholus.ownTiles(player, TileType.THOLUS_METROPOLIS).length > 0;
  }

  public override bespokeCanAct(player: IPlayer) {
    return this.canMetropolis(player) || this.canMegalopolis(player);
  }

  private upgrade(player: IPlayer, from: TileType, to: TileType, cost: number, frames: number): SelectSpace {
    const label = to === TileType.THOLUS_MEGALOPOLIS ? 'megalopolis' : 'metropolis';
    return new SelectSpace(`Tholus: select a city to make a ${label}`, Tholus.ownTiles(player, from)).andThen((space) => {
      player.game.defer(new SelectPaymentDeferred(player, cost, {title: `Tholus: pay for the ${label}`}).andThen(() => {
        player.removeResourceFrom(this, frames);
        // An upgrade of the tile in place: still a city, not a new tile placement.
        space.tile = {...space.tile, tileType: to};
        player.game.log('${0} made the city on ${1} a ' + label, (b) => b.player(player).space(space));
      }));
      return undefined;
    });
  }

  public override bespokeAction(player: IPlayer) {
    const metro = () => this.upgrade(player, TileType.CITY, TileType.THOLUS_METROPOLIS, Tholus.METROPOLIS_COST, 2);
    const mega = () => this.upgrade(player, TileType.THOLUS_METROPOLIS, TileType.THOLUS_MEGALOPOLIS, Tholus.MEGALOPOLIS_COST, 3);
    if (this.canMetropolis(player) && this.canMegalopolis(player)) {
      return new OrOptions(
        new SelectOption('Make a metropolis (10 M€, 2 frames)').andThen(metro),
        new SelectOption('Make a megalopolis (15 M€, 3 frames)').andThen(mega),
      );
    }
    return this.canMetropolis(player) ? metro() : mega();
  }

  /** Extra VP on top of the usual 1 VP per greenery next to a city. */
  public override getVictoryPoints(player: IPlayer) {
    const board = player.game.board;
    const greeneries = (space: Space) => board.getAdjacentSpaces(space).filter((s) => Board.isGreenerySpace(s)).length;
    let vp = 0;
    Tholus.ownTiles(player, TileType.THOLUS_METROPOLIS).forEach((space) => vp += greeneries(space));
    Tholus.ownTiles(player, TileType.THOLUS_MEGALOPOLIS).forEach((space) => vp += 2 * greeneries(space));
    return vp;
  }
}
