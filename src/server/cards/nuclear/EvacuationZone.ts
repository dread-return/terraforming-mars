import {IProjectCard} from '../IProjectCard';
import {ActionCard} from '../ActionCard';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardResource} from '../../../common/CardResource';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {TileType} from '../../../common/TileType';
import {Space} from '../../boards/Space';
import {SpaceType} from '../../../common/boards/SpaceType';
import {SelectSpace} from '../../inputs/SelectSpace';
import {all} from '../Options';

export class EvacuationZone extends ActionCard implements IProjectCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.EVACUATION_ZONE,
      tags: [Tag.RADIOACTIVE],
      cost: 18,
      requirements: {greeneries: 1, all},
      tilesBuilt: [TileType.EVACUATION_ZONE],

      action: {
        spend: {energy: 1},
        addResourcesToAnyCard: {type: CardResource.RADIATION, count: 1},
      },

      metadata: {
        cardNumber: 'N25',
        renderData: CardRenderer.builder((b) => {
          b.action('Spend 1 energy to add a radiation to ANY card.', (eb) => {
            eb.energy(1).startAction.resource(CardResource.RADIATION).asterix();
          }).br;
          b.tile(TileType.EVACUATION_ZONE, false).asterix();
        }),
        description: 'Requires a greenery in play. Place the Evacuation Zone tile on top of a greenery; the owner of that greenery owns this tile. ' +
          'Placing a tile next to it costs 1 plant and 1 microbe.',
      },
    });
  }

  private spaces(player: IPlayer): ReadonlyArray<Space> {
    return player.game.board.spaces.filter((space) =>
      space.spaceType !== SpaceType.COLONY && space.tile?.tileType === TileType.GREENERY);
  }

  public override bespokeCanPlay(player: IPlayer) {
    return this.spaces(player).length > 0;
  }

  public override bespokePlay(player: IPlayer) {
    return new SelectSpace('Select a greenery for the Evacuation Zone', this.spaces(player)).andThen((space) => {
      const owner = space.player;
      player.game.addTile(player, space, {tileType: TileType.EVACUATION_ZONE, card: this.name, covers: space.tile});
      space.player = owner;
      return undefined;
    });
  }
}
