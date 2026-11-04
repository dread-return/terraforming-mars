import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {PlaceGreeneryTile} from '../../deferredActions/PlaceGreeneryTile';
import {MAX_OXYGEN_LEVEL} from '../../../common/constants';

export class AssistedGrowthPlants extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.AUTOMATED,
      name: CardName.ASSISTED_GROWTH_PLANTS,
      tags: [Tag.PLANT, Tag.SCIENCE],
      cost: 35,
      requirements: {oxygen: MAX_OXYGEN_LEVEL},

      metadata: {
        cardNumber: 'B45',
        renderData: CardRenderer.builder((b) => {
          b.greenery().greenery().greenery();
        }),
        description: 'Requires maximum oxygen. Place 3 greenery tiles.',
      },
    });
  }

  public override bespokeCanPlay(player: IPlayer) {
    return player.game.board.getAvailableSpacesForGreenery(player).length > 0;
  }

  public override bespokePlay(player: IPlayer) {
    for (let i = 0; i < 3; i++) {
      player.game.defer(new PlaceGreeneryTile(player));
    }
    return undefined;
  }
}
