import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {CardType} from '../../../common/cards/CardType';
import {Card} from '../Card';
import {IPlayer} from '../../IPlayer';
import {IProjectCard} from '../IProjectCard';
import {Resource} from '../../../common/Resource';
import {SelectColony} from '../../inputs/SelectColony';
import {Tag} from '../../../common/cards/Tag';

export class PrivateColony extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.AUTOMATED,
      name: CardName.PRIVATE_COLONY,
      tags: [Tag.SPACE],
      cost: 6,
      metadata: {
        cardNumber: 'E106',
        renderData: CardRenderer.builder((b) => {
          b.production((pb) => pb.minus().megacredits(1)).colonies(1).asterix();
        }),
        description: 'Place a colony on the colony tile with the lowest current track marker, ignoring normal placement restrictions (choose if tied). Decrease your M\u20ac production 1 step.',
      },
    });
  }

  private lowest(player: IPlayer) {
    const active = player.game.colonies.filter((c) => c.isActive && !c.isFull());
    if (active.length === 0) {
      return [];
    }
    const min = Math.min(...active.map((c) => c.trackPosition));
    return active.filter((c) => c.trackPosition === min);
  }
  public override bespokeCanPlay(player: IPlayer) {
    return this.lowest(player).length > 0 && player.production.megacredits > -5;
  }
  public override bespokePlay(player: IPlayer) {
    player.production.add(Resource.MEGACREDITS, -1, {log: true});
    return new SelectColony('Select a colony tile with the lowest track', 'Build', this.lowest(player)).andThen((colony) => {
      colony.addColony(player);
      return undefined;
    });
  }
}
