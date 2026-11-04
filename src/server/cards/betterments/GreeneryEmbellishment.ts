import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {Resource} from '../../../common/Resource';
import {BettermentsUtils} from './BettermentsUtils';

export class GreeneryEmbellishment extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.AUTOMATED,
      name: CardName.GREENERY_EMBELLISHMENT,
      tags: [Tag.PLANT],
      cost: 18,
      requirements: {tag: Tag.PLANT, count: 5},
      victoryPoints: 2,

      metadata: {
        cardNumber: 'B13',
        renderData: CardRenderer.builder((b) => {
          b.production((pb) => pb.megacredits(2)).slash().city().asterix();
        }),
        description: 'Requires 5 plant tags. Increase your M€ production 2 steps for each city you own that is next to at least one greenery tile.',
      },
    });
  }

  public static count(player: IPlayer): number {
    return BettermentsUtils.citiesOnMars(player)
      .filter((space) => BettermentsUtils.adjacentGreeneries(player, space) >= 1)
      .length;
  }

  public override bespokePlay(player: IPlayer) {
    player.production.add(Resource.MEGACREDITS, 2 * GreeneryEmbellishment.count(player), {log: true});
    return undefined;
  }
}
