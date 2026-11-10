import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {CardType} from '../../../common/cards/CardType';
import {Card} from '../Card';
import {IPlayer} from '../../IPlayer';
import {IProjectCard} from '../IProjectCard';
import {Resource} from '../../../common/Resource';
import {Tag} from '../../../common/cards/Tag';
import {all} from '../Options';

export class PowerFailure extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.EVENT,
      name: CardName.POWER_FAILURE,
      tags: [Tag.POWER, Tag.EVENT],
      cost: 8,
      metadata: {
        cardNumber: 'E30',
        renderData: CardRenderer.builder((b) => {
          b.production((pb) => pb.minus().energy(1, {all})).nbsp.minus().energy(3, {all});
        }),
        description: 'ALL players, including you, decrease their energy production 1 step and lose 3 energy.',
      },
    });
  }

  public override bespokePlay(player: IPlayer) {
    for (const p of player.game.players) {
      if (p.production.energy > 0) {
        p.production.add(Resource.ENERGY, -1, {log: true, from: {player}});
      }
      p.stock.deduct(Resource.ENERGY, Math.min(3, p.energy), {log: true, from: {player}});
    }
    return undefined;
  }
}
