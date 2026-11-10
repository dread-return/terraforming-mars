import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {EternityUtils} from './EternityUtils';
import {IPlayer} from '../../IPlayer';
import {PreludeCard} from '../prelude/PreludeCard';
import {Resource} from '../../../common/Resource';
import {Size} from '../../../common/cards/render/Size';
import {Tag} from '../../../common/cards/Tag';
import {digit} from '../Options';

export class NebulaEnergyFieldPortal extends PreludeCard {
  constructor() {
    super({
      name: CardName.NEBULA_ENERGY_FIELD_PORTAL,
      tags: [Tag.SCIENCE, Tag.POWER, Tag.SPACE],
      victoryPoints: 1,
      metadata: {
        cardNumber: 'EP41',
        renderData: CardRenderer.builder((b) => {
          b.text('Counts as 2 preludes. If it is your last prelude play, play the top prelude instead.', {size: Size.SMALL, isBold: false}).br;
          b.production((pb) => pb.energy(2)).cards(8, {digit});
        }),
        description: 'Increase your energy production 2 steps. Draw 8 cards.',
      },
    });
  }

  public override bespokePlay(player: IPlayer) {
    EternityUtils.playDoublePrelude(player, this, () => {
      player.production.add(Resource.ENERGY, 2, {log: true});
      player.drawCard(8);
    });
    return undefined;
  }
}
