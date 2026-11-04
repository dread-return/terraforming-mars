import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {Resource} from '../../../common/Resource';
import {SelectAmount} from '../../inputs/SelectAmount';
import {TurmoilHandler} from '../../turmoil/TurmoilHandler';
import {REDS_RULING_POLICY_COST} from '../../../common/constants';

export class GreenAreasIntegration extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.EVENT,
      name: CardName.GREEN_AREAS_INTEGRATION,
      tags: [Tag.SPACE],
      cost: 24,
      victoryPoints: 2,

      metadata: {
        cardNumber: 'B20',
        renderData: CardRenderer.builder((b) => {
          b.plants(3).colon().tr(1).text('(max 5)');
        }),
        description: 'Spend 3 plants to raise your TR 1 step. You may do this up to 5 times.',
      },
    });
  }

  public override bespokePlay(player: IPlayer) {
    let max = Math.min(5, Math.floor(player.plants / 3));
    // The amount is chosen at play time, so the Reds cost has to be checked and paid here.
    while (max > 0 && !player.canAfford({cost: 0, tr: {tr: max}})) {
      max--;
    }
    if (max === 0) {
      return undefined;
    }
    return new SelectAmount('Select how many times to spend 3 plants for 1 TR', 'Confirm', 0, max, true)
      .andThen((amount) => {
        if (amount > 0) {
          player.stock.deduct(Resource.PLANTS, 3 * amount);
          const redsCost = TurmoilHandler.computeTerraformRatingBump(player, {tr: amount}) * REDS_RULING_POLICY_COST;
          if (redsCost > 0) {
            player.stock.deduct(Resource.MEGACREDITS, redsCost);
          }
          player.increaseTerraformRating(amount, {log: true});
        }
        return undefined;
      });
  }
}
