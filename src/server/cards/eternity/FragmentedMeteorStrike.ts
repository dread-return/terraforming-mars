import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {CardType} from '../../../common/cards/CardType';
import {Card} from '../Card';
import {IPlayer} from '../../IPlayer';
import {IProjectCard} from '../IProjectCard';
import {Resource} from '../../../common/Resource';
import {SelectSpace} from '../../inputs/SelectSpace';
import {Size} from '../../../common/cards/render/Size';
import {Tag} from '../../../common/cards/Tag';
import {TileType} from '../../../common/TileType';

export class FragmentedMeteorStrike extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.EVENT,
      name: CardName.FRAGMENTED_METEOR_STRIKE,
      tags: [Tag.SPACE],
      cost: 14,
      behavior: {
        global: {temperature: 1},
      },
      metadata: {
        cardNumber: 'E71',
        renderData: CardRenderer.builder((b) => {
          b.temperature(1).tile(TileType.GROUND_ZERO, false).asterix().br;
          b.text('Each adjacent tile: its owner', {size: Size.SMALL, isBold: false}).minus().plants(1).plus().titanium(1);
        }),
        description: 'Raise the temperature 1 step. Place the Ground Zero tile on any non-reserved area. For each tile adjacent to it, its owner loses 1 plant and gains 1 titanium.',
      },
    });
  }

  public override bespokeCanPlay(player: IPlayer) {
    return player.game.board.getAvailableSpacesOnLand(player).length > 0;
  }
  public override bespokePlay(player: IPlayer) {
    const game = player.game;
    return new SelectSpace('Select space for Ground Zero', game.board.getAvailableSpacesOnLand(player)).andThen((space) => {
      game.addTile(player, space, {tileType: TileType.GROUND_ZERO, card: this.name});
      for (const adj of game.board.getAdjacentSpaces(space)) {
        const owner = adj.player;
        if (adj.tile === undefined || owner === undefined) {
          continue;
        }
        if (owner.plants > 0 && (owner === player || !owner.plantsAreProtected())) {
          owner.stock.deduct(Resource.PLANTS, 1, {log: true, from: {player}});
        }
        owner.stock.add(Resource.TITANIUM, 1, {log: true});
      }
      return undefined;
    });
  }
}
