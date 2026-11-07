import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardResource} from '../../../common/CardResource';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {GlobalParameter} from '../../../common/GlobalParameter';
import {AddResourcesToCard} from '../../deferredActions/AddResourcesToCard';

export class RadioactiveEnhancement extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.RADIOACTIVE_ENHANCEMENT,
      tags: [Tag.RADIOACTIVE, Tag.POWER],
      cost: 11,
      behavior: {production: {energy: 1}},

      metadata: {
        cardNumber: 'N01',
        renderData: CardRenderer.builder((b) => {
          b.effect('When you raise the temperature, add a radiation to ANY card.', (eb) => {
            eb.temperature(1).startEffect.resource(CardResource.RADIATION).asterix();
          }).br;
          b.production((pb) => pb.energy(1));
        }),
        description: 'Increase your energy production 1 step.',
      },
    });
  }

  public onGlobalParameterIncrease(player: IPlayer, parameter: GlobalParameter, steps: number) {
    if (parameter === GlobalParameter.TEMPERATURE && steps > 0) {
      player.game.defer(new AddResourcesToCard(player, CardResource.RADIATION, {count: steps, log: true}));
    }
  }
}
