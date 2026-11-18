import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {PartyName} from '../../../common/turmoil/PartyName';
import {Resource} from '../../../common/Resource';
import {all} from '../Options';

/** H67. */
export class ElectoralCampaign extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.EVENT,
      name: CardName.ELECTORAL_CAMPAIGN,
      tags: [],
      cost: 0,
      requirements: {party: PartyName.CENTRISTS},

      metadata: {
        cardNumber: 'H67',
        renderData: CardRenderer.builder((b) => {
          b.tr(1, {all}).nbsp.megacredits(7);
        }),
        description: 'Requires that Centrists are ruling or that you have 2 delegates there. All players raise their TR 1 step. You gain 7 M€.',
      },
    });
  }

  public override bespokePlay(player: IPlayer) {
    for (const p of player.game.players) {
      p.increaseTerraformRating(1, {log: true});
    }
    player.stock.add(Resource.MEGACREDITS, 7, {log: true});
    return undefined;
  }
}
