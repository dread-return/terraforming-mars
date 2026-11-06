import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {Resource} from '../../../common/Resource';
import {all} from '../Options';

export class GalaxyExpress extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.AUTOMATED,
      name: CardName.GALAXY_EXPRESS,
      tags: [Tag.SPACE],
      cost: 16,

      metadata: {
        cardNumber: 'I63',
        renderData: CardRenderer.builder((b) => {
          b.production((pb) => pb.megacredits(1).slash().colonies(1, {all}).asterix());
        }),
        description: 'Increase your M€ production 1 step for each colony your opponents own.',
      },
    });
  }

  public static opponentColonies(player: IPlayer): number {
    let count = 0;
    for (const colony of player.game.colonies) {
      count += colony.colonies.filter((id) => id !== player.id).length;
    }
    return count;
  }

  public override bespokePlay(player: IPlayer) {
    const count = GalaxyExpress.opponentColonies(player);
    if (count > 0) {
      player.production.add(Resource.MEGACREDITS, count, {log: true});
    }
    return undefined;
  }
}
