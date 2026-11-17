import {CardName} from '../../../common/cards/CardName';
import {CardType} from '../../../common/cards/CardType';
import {Tag} from '../../../common/cards/Tag';
import {GlobalParameter} from '../../../common/GlobalParameter';
import {CardRenderer} from '../render/CardRenderer';
import {Card} from '../Card';
import {IProjectCard} from '../IProjectCard';
import {IPlayer} from '../../IPlayer';
import {Mercury} from '../../mercury/Mercury';

export class AtmosphereAnalysis extends Card implements IProjectCard {
  constructor() {
    super({
      name: CardName.ATMOSPHERE_ANALYSIS,
      type: CardType.ACTIVE,
      tags: [Tag.SCIENCE, Tag.SPACE, Tag.MERCURY],
      cost: 18,
      behavior: {
        production: {heat: 3},
      },
      metadata: {
        cardNumber: 'MM04',
        renderData: CardRenderer.builder((b) => {
          b.effect('When you raise temperature, add 1 asset to an Act.', (eb) => {
            eb.temperature(1).startEffect.asset(1);
          }).br;
          b.production((pb) => pb.heat(3));
        }),
        description: 'Increase your heat production 3 steps.',
      },
    });
  }

  public onGlobalParameterIncrease(player: IPlayer, parameter: GlobalParameter) {
    if (parameter === GlobalParameter.TEMPERATURE) {
      Mercury.gainAssets(player, 1);
    }
  }
}
