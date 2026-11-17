import {CardName} from '../../../common/cards/CardName';
import {CardType} from '../../../common/cards/CardType';
import {Tag} from '../../../common/cards/Tag';
import {Resource} from '../../../common/Resource';
import {CardRenderer} from '../render/CardRenderer';
import {Card} from '../Card';
import {IProjectCard} from '../IProjectCard';
import {IActionCard} from '../ICard';
import {IPlayer} from '../../IPlayer';
import {Mercury} from '../../mercury/Mercury';
import {SelectResource} from '../../inputs/SelectResource';

export class InfrastructureInvestments extends Card implements IProjectCard, IActionCard {
  constructor() {
    super({
      name: CardName.INFRASTRUCTURE_INVESTMENTS,
      type: CardType.ACTIVE,
      tags: [Tag.BUILDING],
      cost: 10,
      requirements: {tag: Tag.BUILDING, count: 5},
      victoryPoints: 1,
      metadata: {
        cardNumber: 'MM31',
        renderData: CardRenderer.builder((b) => {
          b.action('Spend 2 steel to add an asset to an Act and gain 2 standard resources of your choice.', (ab) => {
            ab.steel(2).startAction.asset(1).wild(2);
          });
        }),
        description: 'Requires 5 building tags.',
      },
    });
  }

  public canAct(player: IPlayer) {
    return player.steel >= 2;
  }

  public action(player: IPlayer) {
    player.stock.deduct(Resource.STEEL, 2, {log: true});
    Mercury.gainAssets(player, 1);
    for (let i = 0; i < 2; i++) {
      player.defer(new SelectResource('Gain 1 standard resource').andThen((unit) => {
        player.stock.add(unit, 1, {log: true});
        return undefined;
      }));
    }
    return undefined;
  }
}
