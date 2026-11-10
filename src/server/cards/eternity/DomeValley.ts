import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {EternityUtils} from './EternityUtils';
import {IPlayer} from '../../IPlayer';
import {OrOptions} from '../../inputs/OrOptions';
import {PreludeCard} from '../prelude/PreludeCard';
import {Resource} from '../../../common/Resource';
import {SelectOption} from '../../inputs/SelectOption';
import {Size} from '../../../common/cards/render/Size';
import {Tag} from '../../../common/cards/Tag';
import {Units} from '../../../common/Units';

export class DomeValley extends PreludeCard {
  constructor() {
    super({
      name: CardName.DOME_VALLEY,
      tags: [Tag.PLANT, Tag.PLANT, Tag.BUILDING],
      victoryPoints: 1,
      metadata: {
        cardNumber: 'EP11',
        renderData: CardRenderer.builder((b) => {
          b.text('Counts as playing 2 preludes. If it is your last prelude play, discard it and play the top prelude instead. Cannot be copied.', {size: Size.SMALL}).br;
          b.production((pb) => pb.plants(2).heat(2)).plants(2).slash().heat(2);
        }),
        description: 'Increase your plant and heat production 2 steps. Gain 2 plants or 2 heat.',
      },
    });
  }

  public override bespokePlay(player: IPlayer) {
    EternityUtils.playDoublePrelude(player, this, () => {
      player.production.adjust(Units.of({plants: 2, heat: 2}), {log: true});
      player.defer(new OrOptions(
        new SelectOption('Gain 2 plants').andThen(() => {
          player.stock.add(Resource.PLANTS, 2, {log: true}); return undefined;
        }),
        new SelectOption('Gain 2 heat').andThen(() => {
          player.stock.add(Resource.HEAT, 2, {log: true}); return undefined;
        })));
    });
    return undefined;
  }
}
