import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {EternityUtils} from './EternityUtils';
import {IPlayer} from '../../IPlayer';
import {PreludeCard} from '../prelude/PreludeCard';
import {Resource} from '../../../common/Resource';
import {Size} from '../../../common/cards/render/Size';
import {Tag} from '../../../common/cards/Tag';
import {all} from '../Options';

export class MentalBreakdown extends PreludeCard {
  constructor() {
    super({
      name: CardName.MENTAL_BREAKDOWN,
      tags: [Tag.RADIOACTIVE, Tag.RADIOACTIVE],
      victoryPoints: 1,
      metadata: {
        cardNumber: 'EP36',
        renderData: CardRenderer.builder((b) => {
          b.text('Counts as 2 preludes. If it is your last prelude play, play the top prelude instead.', {size: Size.SMALL, isBold: false}).br;
          b.production((pb) => pb.megacredits(-5, {all})).minus().tr(1, {all});
        }),
        description: "Decrease all other players' M\u20ac production 5 steps and their TR 1 step.",
      },
    });
  }

  public override bespokePlay(player: IPlayer) {
    EternityUtils.playDoublePrelude(player, this, () => {
      for (const p of player.opponents) {
        p.production.add(Resource.MEGACREDITS, -5, {log: true, from: {player}});
        p.decreaseTerraformRating(1, {log: true});
      }
    });
    return undefined;
  }
}
