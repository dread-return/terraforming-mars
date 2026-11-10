import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {EternityUtils} from './EternityUtils';
import {IPlayer} from '../../IPlayer';
import {PreludeCard} from '../prelude/PreludeCard';
import {Size} from '../../../common/cards/render/Size';
import {Tag} from '../../../common/cards/Tag';

export class TerraMars extends PreludeCard {
  constructor() {
    super({
      name: CardName.TERRA_MARS,
      tags: [Tag.MARS],
      victoryPoints: 1,
      metadata: {
        cardNumber: 'EP58',
        renderData: CardRenderer.builder((b) => {
          b.text('Counts as playing 2 preludes. If it is your last prelude play, discard it and play the top prelude instead. Cannot be copied.', {size: Size.SMALL}).br;
          b.tr(6);
        }),
        description: 'Raise your TR 6 steps.',
      },
    });
  }

  public override bespokePlay(player: IPlayer) {
    EternityUtils.playDoublePrelude(player, this, () => {
      player.increaseTerraformRating(6);
    });
    return undefined;
  }
}
