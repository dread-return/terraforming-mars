import {CardName} from '../../../common/cards/CardName';
import {CardType} from '../../../common/cards/CardType';
import {Tag} from '../../../common/cards/Tag';
import {TileType} from '../../../common/TileType';
import {SpaceName} from '../../../common/boards/SpaceName';
import {CardRenderer} from '../render/CardRenderer';
import {Card} from '../Card';
import {IProjectCard} from '../IProjectCard';
import {IPlayer} from '../../IPlayer';

export class FloraExperiments extends Card implements IProjectCard {
  constructor() {
    super({
      name: CardName.FLORA_EXPERIMENTS,
      type: CardType.AUTOMATED,
      tags: [Tag.PLANT, Tag.BUILDING, Tag.MERCURY],
      cost: 20,
      behavior: {
        production: {plants: 2},
      },
      metadata: {
        cardNumber: 'MM02',
        renderData: CardRenderer.builder((b) => {
          b.production((pb) => pb.plants(2)).greenery().asterix();
        }),
        description: 'Increase your plant production 2 steps. Place a greenery tile on the Shadow Forest reserved area on Mercury (do not increase the oxygen on Mars for this greenery).',
      },
    });
  }

  public override bespokePlay(player: IPlayer) {
    const space = player.game.board.spaces.find((s) => s.id === SpaceName.SHADOW_FOREST);
    if (space !== undefined && space.tile === undefined) {
      player.game.addTile(player, space, {tileType: TileType.GREENERY});
    }
    return undefined;
  }
}
