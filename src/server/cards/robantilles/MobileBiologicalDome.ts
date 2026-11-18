import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {TileType} from '../../../common/TileType';
import {SpaceBonus} from '../../../common/boards/SpaceBonus';
import {SpaceType} from '../../../common/boards/SpaceType';
import {CardResource} from '../../../common/CardResource';
import {PartyName} from '../../../common/turmoil/PartyName';
import {SelectSpace} from '../../inputs/SelectSpace';
import {Space} from '../../boards/Space';
import {RobAntillesTiles} from './RobAntillesTiles';

const SEEDS_FOR_GREENERY = 3;

/**
 * H06. Its dome tile leaves a greenery behind every 3 generations and moves to a free area next to it.
 */
export class MobileBiologicalDome extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.MOBILE_BIOLOGICAL_DOME,
      tags: [Tag.PLANT, Tag.BUILDING],
      cost: 16,
      requirements: {party: PartyName.SPOME},
      resourceType: CardResource.SEED,
      tilesBuilt: [TileType.BIOLOGICAL_DOME],

      metadata: {
        cardNumber: 'H06',
        renderData: CardRenderer.builder((b) => {
          b.effect('During the production phase, add 1 seed here. When there are 3 seeds here, remove them to place a greenery ' +
            'under the Biological Dome tile, then move the dome to an empty area next to it (or remove it if there is none).', (eb) => {
            eb.empty().startEffect.resource(CardResource.SEED).asterix();
          }).br;
          b.tile(TileType.BIOLOGICAL_DOME, false).asterix();
        }),
        description: 'Requires that Spome are ruling or that you have 2 delegates there. Place the Biological Dome tile. Adjacency bonus: 1 plant.',
      },
    });
  }

  public override bespokeCanPlay(player: IPlayer) {
    return player.game.board.getAvailableSpacesOnLand(player).length > 0;
  }

  public override bespokePlay(player: IPlayer) {
    return RobAntillesTiles.place(player, this.name, TileType.BIOLOGICAL_DOME,
      player.game.board.getAvailableSpacesOnLand(player),
      [SpaceBonus.PLANT], 'Select space for the Biological Dome');
  }

  public onProductionPhase(player: IPlayer) {
    const domeSpace = player.game.board.spaces.find((space) => space.tile?.tileType === TileType.BIOLOGICAL_DOME && space.tile.card === this.name);
    if (domeSpace === undefined) {
      return undefined;
    }
    this.resourceCount++;
    if (this.resourceCount < SEEDS_FOR_GREENERY) {
      return undefined;
    }
    this.resourceCount -= SEEDS_FOR_GREENERY;
    player.defer(() => this.moveDome(player, domeSpace));
    return undefined;
  }

  /** The empty land areas next to the dome it can move to. */
  public static destinations(player: IPlayer, domeSpace: Space): ReadonlyArray<Space> {
    return player.game.board.getAdjacentSpaces(domeSpace).filter((space) =>
      space.spaceType === SpaceType.LAND && space.tile === undefined && space.cube === undefined);
  }

  private moveDome(player: IPlayer, domeSpace: Space) {
    const game = player.game;
    const dome = domeSpace.tile;
    const leaveGreenery = (to: Space | undefined) => {
      domeSpace.tile = undefined;
      domeSpace.player = undefined;
      domeSpace.adjacency = undefined;
      if (to !== undefined && dome !== undefined) {
        to.tile = dome;
        to.player = player;
        to.adjacency = {bonus: [SpaceBonus.PLANT]};
        game.log('${0} moved the Biological Dome', (b) => b.player(player));
      } else {
        game.log('The Biological Dome has nowhere to move and is removed', (b) => b);
      }
      game.addGreenery(player, domeSpace);
      return undefined;
    };
    const destinations = MobileBiologicalDome.destinations(player, domeSpace);
    if (destinations.length === 0) {
      return leaveGreenery(undefined);
    }
    return new SelectSpace('Select where the Biological Dome moves', destinations).andThen(leaveGreenery);
  }
}
