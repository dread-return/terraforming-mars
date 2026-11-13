import {CardMetadata} from '../../../common/cards/CardMetadata';
import {
  INDUSTRY_COST, INDUSTRY_RESOURCES, INDUSTRY_STANDARD_PROJECT, INDUSTRY_TILE, IndustryKind,
} from '../../../common/industries/Industries';
import {IPlayer} from '../../IPlayer';
import {Industries} from '../../industries/Industries';
import {PlaceTile} from '../../deferredActions/PlaceTile';
import {StandardProjectCard} from '../StandardProjectCard';
import {CardRenderer} from '../render/CardRenderer';

const NAMES: Readonly<Record<IndustryKind, string>> = {
  money: 'M€',
  heat: 'heat',
  energy: 'energy',
  steel: 'steel',
  plant: 'plants',
  titanium: 'titanium',
  random: 'a standard resource of your choice',
};

function describe(kind: IndustryKind): string {
  const cost = INDUSTRY_COST[kind];
  const count = INDUSTRY_RESOURCES[kind];
  const placement = kind === 'random' ?
    'Place 1 resource of any type on an area next to the tile.' :
    `Distribute ${count} ${NAMES[kind]} over two areas next to the tile (at least 1 on each).`;
  const production = kind === 'random' ? 'any production' : `your ${NAMES[kind]} production`;
  return `Spend ${cost} M€ to place an industry tile on an area and raise ${production} 1 step. ${placement} ` +
    'The owner of a tile there collects them; otherwise the next tile placed there does. ' +
    'You need more power tags than industries you own.';
}

function industryMetadata(kind: IndustryKind): CardMetadata {
  return {
    cardNumber: 'SP',
    renderData: CardRenderer.builder((b) =>
      b.standardProject(describe(kind), (eb) => {
        eb.megacredits(INDUSTRY_COST[kind]).asterix().startAction
          .tile(INDUSTRY_TILE[kind])
          .production((pb) => {
            switch (kind) {
            case 'money': pb.megacredits(1); break;
            case 'heat': pb.heat(1); break;
            case 'energy': pb.energy(1); break;
            case 'steel': pb.steel(1); break;
            case 'plant': pb.plants(1); break;
            case 'titanium': pb.titanium(1); break;
            case 'random': pb.wild(1); break;
            }
          });
      }),
    ),
  };
}

/**
 * An Industries standard project: place an industry tile, raise a production by 1, and distribute
 * resources onto areas next to the tile.
 */
export abstract class IndustryStandardProject extends StandardProjectCard {
  constructor(private readonly kind: IndustryKind) {
    super({
      name: INDUSTRY_STANDARD_PROJECT[kind],
      cost: INDUSTRY_COST[kind],
      metadata: industryMetadata(kind),
    });
  }

  protected override bespokeCanAct(player: IPlayer): boolean {
    if (!Industries.canBuild(player)) {
      return false;
    }
    return player.game.board.getAvailableSpacesOnLand(player).length > 0;
  }

  public actionEssence(player: IPlayer): void {
    // Paying with steel or titanium from Machinery Factory / Metallurgy Workshop limits where the tile can go.
    const restricted = this.placementSpaces;
    player.game.defer(new PlaceTile(player, {
      tile: {tileType: INDUSTRY_TILE[this.kind]},
      on: restricted === undefined ? 'land' : () => restricted,
      title: 'Select space for the industry',
    })).andThen((space) => Industries.onPlaced(player, this.kind, space));
  }
}
