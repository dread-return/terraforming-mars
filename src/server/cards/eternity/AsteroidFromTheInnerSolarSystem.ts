import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {CardResource} from '../../../common/CardResource';
import {CardType} from '../../../common/cards/CardType';
import {Card} from '../Card';
import {IPlayer} from '../../IPlayer';
import {IProjectCard} from '../IProjectCard';
import {Tag} from '../../../common/cards/Tag';
import {digit} from '../Options';

export class AsteroidFromTheInnerSolarSystem extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.EVENT,
      name: CardName.ASTEROID_FROM_THE_INNER_SOLAR_SYSTEM,
      tags: [Tag.VENUS, Tag.SPACE],
      cost: 47,
      behavior: {
        production: {heat: 2},
        addResourcesToAnyCard: {count: 2, type: CardResource.FLOATER},
      },
      metadata: {
        cardNumber: 'E44',
        renderData: CardRenderer.builder((b) => {
          b.venus(4, {digit}).br.production((pb) => pb.heat(2)).resource(CardResource.FLOATER, 2).asterix();
        }),
        description: 'Raise Venus 4 steps. Increase your heat production 2 steps. Add 2 floaters to any card.',
      },
    });
  }

  public override bespokePlay(player: IPlayer) {
    player.game.increaseVenusScaleLevel(player, 3);
    player.game.increaseVenusScaleLevel(player, 1);
    return undefined;
  }
}
