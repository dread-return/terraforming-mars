import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';
import {PartyName} from '../../../common/turmoil/PartyName';
import {IPlayer} from '../../IPlayer';
import {Resource} from '../../../common/Resource';
import {PLANETARY_TAGS} from '../../pathfinders/PathfindersData';

/**
 * S35. Looks at the lowest Pathfinders planetary track in play (tracks not used this game are left
 * out). When several are tied for lowest, the player gets the best of them.
 */
export class WanderingStationHermes extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.AUTOMATED,
      name: CardName.WANDERING_STATION_HERMES,
      tags: [Tag.JOVIAN, Tag.SPACE],
      cost: 18,
      victoryPoints: 1,
      requirements: {party: PartyName.SPOME},

      metadata: {
        cardNumber: 'S35',
        renderData: CardRenderer.builder((b) => {
          b.production((pb) => pb.megacredits(1)).slash().text('tag of the lowest planetary track', {size: Size.SMALL});
        }),
        description: 'Requires that Spome are ruling or that you have 2 delegates there. Increase your M€ production 1 step for each tag you have of the lowest Planetary Influence track.',
      },
    });
  }

  public static production(player: IPlayer): number {
    const data = player.game.pathfindersData;
    if (data === undefined) {
      return 0;
    }
    const tracks = PLANETARY_TAGS.filter((tag) => data[tag] >= 0);
    if (tracks.length === 0) {
      return 0;
    }
    const lowest = Math.min(...tracks.map((tag) => data[tag]));
    return Math.max(...tracks.filter((tag) => data[tag] === lowest).map((tag) => player.tags.count(tag, 'raw')));
  }

  public override bespokePlay(player: IPlayer) {
    player.production.add(Resource.MEGACREDITS, WanderingStationHermes.production(player), {log: true});
    return undefined;
  }
}
