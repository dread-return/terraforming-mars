import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {EternityUtils} from './EternityUtils';
import {IPlayer} from '../../IPlayer';
import {PreludeCard} from '../prelude/PreludeCard';
import {Resource} from '../../../common/Resource';
import {Size} from '../../../common/cards/render/Size';
import {Tag} from '../../../common/cards/Tag';
import {digit} from '../Options';

export class HeavyMiner extends PreludeCard {
  constructor() {
    super({
      name: CardName.HEAVY_MINER,
      tags: [Tag.BUILDING, Tag.BUILDING, Tag.BUILDING],
      victoryPoints: 1,
      metadata: {
        cardNumber: 'EP24',
        renderData: CardRenderer.builder((b) => {
          b.text('Counts as 2 preludes. If it is your last prelude play, play the top prelude instead.', {size: Size.SMALL, isBold: false}).br;
          b.production((pb) => pb.steel(5, {digit}));
        }),
        description: 'Increase your steel production 5 steps.',
      },
    });
  }

  public override bespokePlay(player: IPlayer) {
    EternityUtils.playDoublePrelude(player, this, () => {
      player.production.add(Resource.STEEL, 5, {log: true});
    });
    return undefined;
  }
}
