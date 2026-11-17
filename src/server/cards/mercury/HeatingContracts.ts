import {CardName} from '../../../common/cards/CardName';
import {CardType} from '../../../common/cards/CardType';
import {Resource} from '../../../common/Resource';
import {PartyName} from '../../../common/turmoil/PartyName';
import {GlobalParameter} from '../../../common/GlobalParameter';
import {CardRenderer} from '../render/CardRenderer';
import {Card} from '../Card';
import {IProjectCard} from '../IProjectCard';
import {IPlayer} from '../../IPlayer';

export class HeatingContracts extends Card implements IProjectCard {
  constructor() {
    super({
      name: CardName.HEATING_CONTRACTS,
      type: CardType.ACTIVE,
      cost: 12,
      requirements: {party: PartyName.KELVINISTS},
      behavior: {
        production: {heat: 2},
      },
      metadata: {
        cardNumber: 'MM28',
        renderData: CardRenderer.builder((b) => {
          b.effect('When you raise temperature, increase your M€ production 1 step for each step.', (eb) => {
            eb.temperature(1).startEffect.production((pb) => pb.megacredits(1));
          }).br;
          b.production((pb) => pb.heat(2));
        }),
        description: 'Requires that Kelvinists are ruling or that you have 2 delegates there. Increase your heat production 2 steps.',
      },
    });
  }

  public onGlobalParameterIncrease(player: IPlayer, parameter: GlobalParameter, steps: number) {
    if (parameter === GlobalParameter.TEMPERATURE) {
      player.production.add(Resource.MEGACREDITS, steps, {log: true});
    }
  }
}
