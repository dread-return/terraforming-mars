import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {CardType} from '../../../common/cards/CardType';
import {Card} from '../Card';
import {IPlayer} from '../../IPlayer';
import {IProjectCard} from '../IProjectCard';
import {Resource} from '../../../common/Resource';
import {Size} from '../../../common/cards/render/Size';
import {Tag} from '../../../common/cards/Tag';

export class AquaticLifeBringingAsteroid extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.EVENT,
      name: CardName.AQUATIC_LIFE_BRINGING_ASTEROID,
      tags: [Tag.SPACE, Tag.EVENT],
      cost: 30,
      behavior: {
        ocean: {},
        tr: 1,
        stock: {plants: 2},
      },
      metadata: {
        cardNumber: 'E43',
        renderData: CardRenderer.builder((b) => {
          b.oceans(1).tr(1).br.production((pb) => pb.plants(1)).text('(2 if 5+ oceans)', {size: Size.SMALL}).plants(2);
        }),
        description: 'Place an ocean. Raise your TR 1 step. Increase your plant production 1 step, or 2 steps if there are 5 or more oceans on Mars. Gain 2 plants.',
      },
    });
  }

  public override bespokePlay(player: IPlayer) {
    player.defer(() => {
      player.production.add(Resource.PLANTS, player.game.board.getOceanSpaces().length >= 5 ? 2 : 1, {log: true});
      return undefined;
    });
    return undefined;
  }
}
