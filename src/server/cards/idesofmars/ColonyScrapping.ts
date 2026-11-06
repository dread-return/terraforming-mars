import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {SelectColony} from '../../inputs/SelectColony';
import {Resource} from '../../../common/Resource';

export class ColonyScrapping extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.AUTOMATED,
      name: CardName.COLONY_SCRAPPING,
      cost: 4,
      requirements: {colonies: 1},

      metadata: {
        cardNumber: 'I22',
        renderData: CardRenderer.builder((b) => {
          b.minus().colonies(1).colon().megacredits(12);
        }),
        description: 'Requires that you own a colony. Remove one of your colonies and gain 12 M€.',
      },
    });
  }

  public override bespokePlay(player: IPlayer) {
    const colonies = player.game.colonies.filter((colony) => colony.colonies.includes(player.id));
    if (colonies.length === 0) {
      return undefined;
    }
    return new SelectColony('Select one of your colonies to remove', 'Remove colony', colonies)
      .andThen((colony) => {
        const idx = colony.colonies.indexOf(player.id);
        if (idx >= 0) {
          colony.colonies.splice(idx, 1);
        }
        player.game.log('${0} removed their colony from ${1}', (b) => b.player(player).colony(colony));
        player.stock.add(Resource.MEGACREDITS, 12, {log: true, from: {card: this}});
        return undefined;
      });
  }
}
