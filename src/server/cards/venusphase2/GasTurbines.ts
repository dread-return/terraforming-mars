import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {Resource} from '../../../common/Resource';

export class GasTurbines extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.AUTOMATED,
      name: CardName.GAS_TURBINES,
      tags: [Tag.POWER, Tag.VENUS],
      cost: 11,
      victoryPoints: 1,

      metadata: {
        cardNumber: 'V75',
        renderData: CardRenderer.builder((b) => {
          b.production((pb) => pb.energy(1)).slash().venus(10);
        }),
        description: 'Increase your energy production 1 step for each 10% of Venus reached.',
      },
    });
  }

  public override bespokePlay(player: IPlayer) {
    const count = Math.floor(player.game.getVenusScaleLevel() / 10);
    player.production.add(Resource.ENERGY, count, {log: true});
    return undefined;
  }
}
