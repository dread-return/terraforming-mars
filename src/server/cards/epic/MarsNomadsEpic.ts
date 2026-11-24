import {ActiveCorporationCard} from '../corporation/CorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';
import {IPlayer} from '../../IPlayer';
import {Resource} from '../../../common/Resource';
import {Space} from '../../boards/Space';
import {Board} from '../../boards/Board';
import {OrOptions} from '../../inputs/OrOptions';
import {SelectOption} from '../../inputs/SelectOption';
import {TileType} from '../../../common/TileType';
import {SpaceId} from '../../../common/Types';
import {SelectSpace} from '../../inputs/SelectSpace';

export class MarsNomadsEpic extends ActiveCorporationCard {
  constructor() {
    super({
      name: CardName.MARS_NOMADS_EPIC,
      tags: [Tag.CITY, Tag.MARS],
      startingMegaCredits: 42,
      initialActionText: 'Place your Nomad city',

      action: {},

      metadata: {
        cardNumber: 'EP-MNM',
        description: 'You start with 42 M€. First action: place your Nomad city.',
        renderData: CardRenderer.builder((b) => {
          b.megacredits(42).tile(TileType.NOMAD_CITY).asterix();
          b.corpBox('action', (ce) => {
            ce.vSpace(Size.SMALL);
            ce.action(undefined, (eb) => {
              eb.steel(1).or().megacredits(2).startAction.tile(TileType.NOMAD_CITY).text('2', {size: Size.SMALL}).asterix();
            });
            ce.vSpace(Size.TINY);
            ce.action('1 steel or 2 M€: move it up to 2 spaces to a free land space; gain its bonus and 3 M€ per adjacent ocean.', (eb) => {
              eb.empty().startAction.wild(1).plus().megacredits(3).slash().oceans(1, {size: Size.SMALL});
            });
          });
        }),
      },
    });
  }

  public data: {nomad?: SpaceId} = {};

  public override initialAction(player: IPlayer) {
    const spaces = player.game.board.getAvailableSpacesForCity(player);
    if (spaces.length === 0) {
      return undefined;
    }
    return new SelectSpace('Select space for your Nomad city', spaces).andThen((space) => {
      player.game.addTile(player, space, {tileType: TileType.NOMAD_CITY, card: this.name});
      this.data.nomad = space.id;
      return undefined;
    });
  }

  private nomadSpace(player: IPlayer): Space | undefined {
    if (this.data.nomad === undefined) {
      return undefined;
    }
    const space = player.game.board.getSpaceOrThrow(this.data.nomad);
    return space.tile?.tileType === TileType.NOMAD_CITY ? space : undefined;
  }

  /** Free land spaces up to 2 steps away from the Nomad city. */
  public destinations(player: IPlayer): ReadonlyArray<Space> {
    const board = player.game.board;
    const from = this.nomadSpace(player);
    if (from === undefined) {
      return [];
    }
    const reach = new Set<SpaceId>();
    for (const near of board.getAdjacentSpaces(from)) {
      reach.add(near.id);
      for (const far of board.getAdjacentSpaces(near)) {
        reach.add(far.id);
      }
    }
    reach.delete(from.id);
    return board.getAvailableSpacesOnLand(player).filter((space) => reach.has(space.id));
  }

  public override bespokeCanAct(player: IPlayer) {
    return (player.steel > 0 || player.megaCredits >= 2) && this.destinations(player).length > 0;
  }

  public override bespokeAction(player: IPlayer) {
    const move = () => new SelectSpace('Move your Nomad city', this.destinations(player)).andThen((to) => {
      this.move(player, to);
      return undefined;
    });
    const payWithSteel = new SelectOption('Pay 1 steel').andThen(() => {
      player.stock.deduct(Resource.STEEL, 1, {log: true});
      return move();
    });
    const payWithMoney = new SelectOption('Pay 2 M€').andThen(() => {
      player.stock.deduct(Resource.MEGACREDITS, 2, {log: true});
      return move();
    });
    if (player.steel === 0) {
      return payWithMoney.cb(undefined);
    }
    if (player.megaCredits < 2) {
      return payWithSteel.cb(undefined);
    }
    return new OrOptions(payWithSteel, payWithMoney).setTitle('Mars Nomads: pay to move your Nomad city');
  }

  public move(player: IPlayer, to: Space): void {
    const game = player.game;
    const from = this.nomadSpace(player);
    if (from === undefined) {
      return;
    }
    from.tile = undefined;
    from.player = undefined;
    to.tile = {tileType: TileType.NOMAD_CITY, card: this.name};
    to.player = player;
    this.data.nomad = to.id;
    game.log('${0} moved the Nomad city', (b) => b.player(player));
    game.grantSpaceBonuses(player, to);
    const oceans = game.board.getAdjacentSpaces(to).filter(Board.isOceanSpace).length;
    if (oceans > 0) {
      player.stock.add(Resource.MEGACREDITS, 3 * oceans, {log: true, from: {card: this}});
    }
  }
}
