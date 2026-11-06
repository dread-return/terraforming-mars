import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {PlaceGreeneryTile} from '../../deferredActions/PlaceGreeneryTile';

export class NaturalGrowthCatalyst extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.AUTOMATED,
      name: CardName.NATURAL_GROWTH_CATALYST,
      tags: [Tag.PLANT],
      cost: 20,
      requirements: {oceans: 8},
      tr: {oxygen: 2},

      metadata: {
        cardNumber: 'I62',
        renderData: CardRenderer.builder((b) => {
          b.greenery().greenery();
        }),
        description: 'Requires 8 ocean tiles. Place 2 greenery tiles and raise oxygen 2 steps.',
      },
    });
  }

  public override bespokeCanPlay(player: IPlayer) {
    return player.game.board.getAvailableSpacesForGreenery(player).length > 0;
  }

  public override bespokePlay(player: IPlayer) {
    player.game.defer(new PlaceGreeneryTile(player));
    player.game.defer(new PlaceGreeneryTile(player));
    return undefined;
  }
}
