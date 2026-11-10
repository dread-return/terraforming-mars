import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {EternityUtils} from './EternityUtils';
import {IPlayer} from '../../IPlayer';
import {PreludeCard} from '../prelude/PreludeCard';
import {Size} from '../../../common/cards/render/Size';
import {Tag} from '../../../common/cards/Tag';
import {digit} from '../Options';

export class WarpGate extends PreludeCard {
  constructor() {
    super({
      name: CardName.WARP_GATE,
      tags: [Tag.SCIENCE, Tag.SCIENCE, Tag.SPACE],
      victoryPoints: 1,
      metadata: {
        cardNumber: 'EP66',
        renderData: CardRenderer.builder((b) => {
          b.text('Counts as 2 preludes. If it is your last prelude play, play the top prelude instead.', {size: Size.SMALL, isBold: false}).br;
          b.cards(10, {digit});
        }),
        description: 'Draw 10 cards.',
      },
    });
  }

  public override bespokePlay(player: IPlayer) {
    EternityUtils.playDoublePrelude(player, this, () => {
      player.drawCard(10);
    });
    return undefined;
  }
}
