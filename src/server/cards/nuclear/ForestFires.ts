import {IProjectCard} from '../IProjectCard';
import {ActionCard} from '../ActionCard';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardResource} from '../../../common/CardResource';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {TileType} from '../../../common/TileType';
import {SpaceType} from '../../../common/boards/SpaceType';
import {SelectSpace} from '../../inputs/SelectSpace';
import {max} from '../Options';

export class ForestFires extends ActionCard implements IProjectCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.FOREST_FIRES,
      tags: [Tag.MICROBE],
      cost: 18,
      requirements: {oxygen: 10, max},
      resourceType: CardResource.MICROBE,
      victoryPoints: {resourcesHere: {}, per: 2},

      action: {addResourcesToAnyCard: {type: CardResource.MICROBE, count: 1}},

      metadata: {
        cardNumber: 'N34',
        renderData: CardRenderer.builder((b) => {
          b.action('Add a microbe to ANY card.', (eb) => {
            eb.empty().startAction.resource(CardResource.MICROBE).asterix();
          }).br;
          b.minus().greenery({any: true, withO2: false});
        }),
        description: 'Requires oxygen at most 10%. Remove a greenery tile (oxygen does not change). 1 VP for every 2 microbes on this card.',
      },
    });
  }

  public override bespokePlay(player: IPlayer) {
    const game = player.game;
    const greeneries = game.board.spaces.filter((space) =>
      space.spaceType !== SpaceType.COLONY && space.tile?.tileType === TileType.GREENERY);
    if (greeneries.length === 0) {
      return undefined;
    }
    return new SelectSpace('Select a greenery tile to remove', greeneries).andThen((space) => {
      const owner = space.player;
      game.removeTile(space.id);
      game.log('${0} removed a greenery tile' + (owner !== undefined ? ' owned by ${1}' : ''),
        (b) => {
          b.player(player);
          if (owner !== undefined) {
            b.player(owner);
          }
        });
      return undefined;
    });
  }
}
