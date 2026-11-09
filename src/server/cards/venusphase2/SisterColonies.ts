import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {BuildColony} from '../../deferredActions/BuildColony';

export class SisterColonies extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.AUTOMATED,
      name: CardName.SISTER_COLONIES,
      tags: [Tag.SPACE],
      cost: 24,

      metadata: {
        cardNumber: 'V82',
        renderData: CardRenderer.builder((b) => {
          b.colonies(1).nbsp.colonies(1).asterix();
        }),
        description: 'Place 2 colonies on 2 different colony tiles.',
      },
    });
  }

  public override bespokeCanPlay(player: IPlayer) {
    return player.colonies.getPlayableColonies().length >= 2;
  }

  public override bespokePlay(player: IPlayer) {
    // Without duplicates, the second colony can't go on the tile the first went on.
    player.game.defer(new BuildColony(player, {title: 'Select where to build the first colony'}))
      .andThen(() => player.game.defer(new BuildColony(player, {title: 'Select where to build the second colony'})));
    return undefined;
  }
}
