import {ActiveCorporationCard} from '../corporation/CorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';
import {IPlayer} from '../../IPlayer';
import {CardResource} from '../../../common/CardResource';
import {Space} from '../../boards/Space';
import {Board} from '../../boards/Board';
import {SpaceType} from '../../../common/boards/SpaceType';
import {OrOptions} from '../../inputs/OrOptions';
import {SelectOption} from '../../inputs/SelectOption';
import {sum} from '../../../common/utils/utils';
import {SpaceId} from '../../../common/Types';
import {SelectPaymentDeferred} from '../../deferredActions/SelectPaymentDeferred';
import {SelectSpace} from '../../inputs/SelectSpace';
import * as VP from '../render/DynamicVictoryPoints';

export class Tholus extends ActiveCorporationCard {
  constructor() {
    super({
      name: CardName.THOLUS,
      tags: [Tag.BUILDING, Tag.CITY],
      startingMegaCredits: 40,
      resourceType: CardResource.SPECIAL_STEEL,
      victoryPoints: 'special',

      behavior: {
        production: {steel: 1},
      },

      action: {},

      metadata: {
        cardNumber: 'EP-THL',
        description: 'You start with 40 M€ and 1 steel production.',
        renderData: CardRenderer.builder((b) => {
          b.megacredits(40).production((pb) => pb.steel(1));
          b.corpBox('effect', (ce) => {
            ce.effect('Steel production ±X (incl. this): ±X special steel here.', (eb) => {
              eb.production((pb) => pb.steel(1)).startEffect.resource(CardResource.SPECIAL_STEEL);
            });
            ce.vSpace(Size.TINY);
            ce.action(undefined, (eb) => {
              eb.megacredits(10).resource(CardResource.SPECIAL_STEEL, 2).startAction.city({size: Size.SMALL}).text('×2', {size: Size.SMALL});
            });
            ce.action('City → metropolis: 2 VP per adjacent greenery. Metropolis → megalopolis: 3 VP each.', (eb) => {
              eb.or().megacredits(15).resource(CardResource.SPECIAL_STEEL, 3).startAction.city({size: Size.SMALL}).text('×3', {size: Size.SMALL});
            });
          });
        }),
        victoryPoints: VP.greeneries(1, true),
      },
    });
  }

  public static readonly METROPOLIS_COST = 10;
  public static readonly MEGALOPOLIS_COST = 15;

  /** Upgraded cities: metropolises (2 VP per adjacent greenery) and megalopolises (3). */
  public data: {metro?: Array<SpaceId>, mega?: Array<SpaceId>} = {};

  private cities(player: IPlayer): ReadonlyArray<Space> {
    const upgraded = [...(this.data.metro ?? []), ...(this.data.mega ?? [])];
    return player.game.board.spaces.filter((space) =>
      Board.isCitySpace(space) && space.player === player && space.spaceType !== SpaceType.COLONY && !upgraded.includes(space.id));
  }

  private metropolises(player: IPlayer): ReadonlyArray<Space> {
    return (this.data.metro ?? []).map((id) => player.game.board.getSpaceOrThrow(id)).filter((space) => space.player === player);
  }

  private canMetropolis(player: IPlayer) {
    return this.resourceCount >= 2 && player.canAfford(Tholus.METROPOLIS_COST) && this.cities(player).length > 0;
  }

  private canMegalopolis(player: IPlayer) {
    return this.resourceCount >= 3 && player.canAfford(Tholus.MEGALOPOLIS_COST) && this.metropolises(player).length > 0;
  }

  public override bespokeCanAct(player: IPlayer) {
    return this.canMetropolis(player) || this.canMegalopolis(player);
  }

  private upgrade(player: IPlayer, spaces: ReadonlyArray<Space>, cost: number, steel: number, mega: boolean): SelectSpace {
    const label = mega ? 'megalopolis' : 'metropolis';
    return new SelectSpace(`Tholus: select a city to make a ${label}`, spaces).andThen((space) => {
      player.game.defer(new SelectPaymentDeferred(player, cost, {title: `Tholus: pay for the ${label}`}).andThen(() => {
        player.removeResourceFrom(this, steel);
        if (mega) {
          this.data.metro = (this.data.metro ?? []).filter((id) => id !== space.id);
          this.data.mega = [...(this.data.mega ?? []), space.id];
        } else {
          this.data.metro = [...(this.data.metro ?? []), space.id];
        }
        player.game.log('${0} made the city on ${1} a ' + label, (b) => b.player(player).space(space));
      }));
      return undefined;
    });
  }

  public override bespokeAction(player: IPlayer) {
    const options: Array<SelectSpace> = [];
    if (this.canMetropolis(player)) {
      options.push(this.upgrade(player, this.cities(player), Tholus.METROPOLIS_COST, 2, false));
    }
    if (this.canMegalopolis(player)) {
      options.push(this.upgrade(player, this.metropolises(player), Tholus.MEGALOPOLIS_COST, 3, true));
    }
    if (options.length === 1) {
      return options[0];
    }
    return new OrOptions(
      new SelectOption('Make a metropolis (10 M€, 2 special steel)').andThen(() => options[0]),
      new SelectOption('Make a megalopolis (15 M€, 3 special steel)').andThen(() => options[1]),
    );
  }

  /** Extra VP on top of the usual 1 VP per greenery next to a city. */
  public override getVictoryPoints(player: IPlayer) {
    const board = player.game.board;
    const greeneries = (id: SpaceId) => {
      const space = board.getSpaceOrThrow(id);
      return space.player === player ? board.getAdjacentSpaces(space).filter((s) => Board.isGreenerySpace(s)).length : 0;
    };
    return sum((this.data.metro ?? []).map(greeneries)) + 2 * sum((this.data.mega ?? []).map(greeneries));
  }
}
