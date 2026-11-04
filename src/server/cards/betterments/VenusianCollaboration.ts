import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardResource} from '../../../common/CardResource';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {Resource} from '../../../common/Resource';

export class VenusianCollaboration extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.AUTOMATED,
      name: CardName.VENUSIAN_COLLABORATION,
      tags: [Tag.MARS, Tag.VENUS],
      cost: 21,
      requirements: {floaters: 1},

      behavior: {
        addResourcesToAnyCard: {type: CardResource.FLOATER, count: 3},
      },

      metadata: {
        cardNumber: 'B14',
        renderData: CardRenderer.builder((b) => {
          b.tr(1).slash().venus(1).text('10%').br;
          b.production((pb) => pb.heat(1)).slash().venus(1).text('10%').br;
          b.resource(CardResource.FLOATER, 3).asterix();
        }),
        description: 'Requires that you have a floater. Raise your TR 1 step and increase your heat production 1 step for each 10% of Venus. Add 3 floaters to ANY card.',
      },
    });
  }

  private static steps(player: IPlayer): number {
    return Math.floor(player.game.getVenusScaleLevel() / 10);
  }

  public computeTr(player: IPlayer) {
    return {tr: VenusianCollaboration.steps(player)};
  }

  public override bespokePlay(player: IPlayer) {
    const steps = VenusianCollaboration.steps(player);
    if (steps > 0) {
      player.increaseTerraformRating(steps, {log: true});
      player.production.add(Resource.HEAT, steps, {log: true});
    }
    return undefined;
  }
}
