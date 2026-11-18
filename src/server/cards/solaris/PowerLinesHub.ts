import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {PartyName} from '../../../common/turmoil/PartyName';
import {IPlayer} from '../../IPlayer';
import {Resource} from '../../../common/Resource';
import {sum} from '../../../common/utils/utils';

/** S16. */
export class PowerLinesHub extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.AUTOMATED,
      name: CardName.POWER_LINES_HUB,
      tags: [Tag.POWER, Tag.BUILDING],
      cost: 22,
      victoryPoints: 1,
      requirements: {party: PartyName.EMPOWER},

      metadata: {
        cardNumber: 'S16',
        renderData: CardRenderer.builder((b) => {
          b.production((pb) => pb.energy(1)).slash().tag(Tag.POWER).asterix();
        }),
        description: 'Requires that Empower are ruling or that you have 2 delegates there. Increase your energy production 1 step for each power tag your opponents have.',
      },
    });
  }

  public static opponentPowerTags(player: IPlayer): number {
    return sum(player.opponents.map((opponent) => opponent.tags.count(Tag.POWER, 'raw')));
  }

  public override bespokePlay(player: IPlayer) {
    player.production.add(Resource.ENERGY, PowerLinesHub.opponentPowerTags(player), {log: true});
    return undefined;
  }
}
