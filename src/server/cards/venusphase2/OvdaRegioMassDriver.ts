import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {GlobalParameter} from '../../../common/GlobalParameter';
import {Resource} from '../../../common/Resource';

export class OvdaRegioMassDriver extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.OVDA_REGIO_MASS_DRIVER,
      tags: [Tag.VENUS, Tag.BUILDING],
      cost: 15,
      victoryPoints: 1,

      metadata: {
        cardNumber: 'V50',
        renderData: CardRenderer.builder((b) => {
          b.effect('Whenever you raise Venus, gain 3 heat per step.', (eb) => {
            eb.venus(1).startEffect.heat(3);
          });
        }),
      },
    });
  }

  public onGlobalParameterIncrease(player: IPlayer, parameter: GlobalParameter, steps: number) {
    if (parameter === GlobalParameter.VENUS && steps > 0) {
      player.stock.add(Resource.HEAT, 3 * steps, {log: true, from: {card: this}});
    }
  }
}
