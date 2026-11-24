import {ActiveCorporationCard} from '../corporation/CorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';
import {IPlayer} from '../../IPlayer';
import {Resource} from '../../../common/Resource';
import {Space} from '../../boards/Space';
import {Board} from '../../boards/Board';
import {BoardType} from '../../boards/BoardType';
import {SpaceId} from '../../../common/Types';
import {digit} from '../Options';
import {SelectSpace} from '../../inputs/SelectSpace';
import {SimpleDeferredAction} from '../../deferredActions/DeferredAction';

export class BloomingVales extends ActiveCorporationCard {
  constructor() {
    super({
      name: CardName.BLOOMING_VALES,
      tags: [Tag.PLANT],
      startingMegaCredits: 41,

      behavior: {
        production: {plants: 1},
        stock: {plants: 4},
      },

      action: {},

      metadata: {
        cardNumber: 'EP-BLV',
        description: 'You start with 41 M€, 4 plants and 1 plant production.',
        renderData: CardRenderer.builder((b) => {
          b.megacredits(41).plants(4, {digit}).production((pb) => pb.plants(1));
          b.corpBox('action', (ce) => {
            ce.vSpace(Size.SMALL);
            ce.action('Repeatable: spend 6 plants to put your marker on a free land area on Mars.', (eb) => {
              eb.plants(6, {digit}).startAction.emptyTile('normal', {size: Size.SMALL}).asterix();
            });
            ce.vSpace(Size.TINY);
            ce.effect('A marked area next to an ocean (or all, once oceans are maxed) becomes your greenery.', (eb) => {
              eb.oceans(1, {size: Size.SMALL}).slash().text('max', {size: Size.SMALL}).startEffect.greenery({size: Size.SMALL}).asterix();
            });
          });
        }),
      },
    });
  }

  public static readonly COST = 6;

  /** Spaces marked by this card that haven't become greeneries yet. */
  public data: {vales?: Array<SpaceId>} = {};

  private static freeSpaces(player: IPlayer): ReadonlyArray<Space> {
    return player.game.board.getAvailableSpacesOnLand(player).filter((space) => space.tile === undefined && space.player === undefined);
  }

  public override bespokeCanAct(player: IPlayer) {
    return player.plants >= BloomingVales.COST && BloomingVales.freeSpaces(player).length > 0;
  }

  public override bespokeAction(player: IPlayer) {
    // The action is repeatable.
    player.defer(() => {
      player.actionsThisGeneration.delete(this.name);
    });
    return new SelectSpace('Blooming Vales: select an area to mark', BloomingVales.freeSpaces(player)).andThen((space) => {
      player.stock.deduct(Resource.PLANTS, BloomingVales.COST, {log: true});
      space.player = player;
      this.data.vales = [...(this.data.vales ?? []), space.id];
      player.game.log('${0} marked ${1}', (b) => b.player(player).space(space));
      this.checkVales(player);
      return undefined;
    });
  }

  public onTilePlaced(cardOwner: IPlayer, _activePlayer: IPlayer, _space: Space, boardType: BoardType) {
    if (boardType === BoardType.MARS) {
      this.checkVales(cardOwner);
    }
  }

  /** Turns marked areas next to an ocean (or all of them, once the oceans are maxed) into greeneries. */
  private checkVales(player: IPlayer) {
    const game = player.game;
    const board = game.board;
    const ready: Array<Space> = [];
    const remaining: Array<SpaceId> = [];
    for (const id of this.data.vales ?? []) {
      const space = board.getSpaceOrThrow(id);
      if (space.tile !== undefined) {
        continue;
      }
      if (!game.canAddOcean() || board.getAdjacentSpaces(space).some((s) => Board.isOceanSpace(s))) {
        ready.push(space);
      } else {
        remaining.push(id);
      }
    }
    this.data.vales = remaining;
    for (const space of ready) {
      game.defer(new SimpleDeferredAction(player, () => {
        if (space.tile === undefined) {
          game.log('${0}\'s marker on ${1} became a greenery', (b) => b.player(player).space(space));
          game.addGreenery(player, space);
        }
        return undefined;
      }));
    }
  }
}
