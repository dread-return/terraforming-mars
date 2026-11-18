import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';
import {PartyName} from '../../../common/turmoil/PartyName';
import {IPlayer} from '../../IPlayer';
import {IMilestone} from '../../milestones/IMilestone';
import {OrOptions} from '../../inputs/OrOptions';
import {SelectOption} from '../../inputs/SelectOption';

/** S37. "Meets" a milestone = could claim it (score at or above its threshold), ignoring cost and limits. */
export class AwardCelebration extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.AUTOMATED,
      name: CardName.AWARD_CELEBRATION,
      tags: [Tag.EARTH],
      cost: 9,
      requirements: {party: PartyName.CENTRISTS},

      metadata: {
        cardNumber: 'S37',
        renderData: CardRenderer.builder((b) => {
          b.text('Choose an unclaimed milestone. If you meet it, raise your TR 2 steps. Each opponent who meets it raises their TR 1 step.', {size: Size.SMALL, isBold: false});
        }),
        description: 'Requires that Centrists are ruling or that you have 2 delegates there.',
      },
    });
  }

  public static unclaimed(player: IPlayer): Array<IMilestone> {
    const game = player.game;
    return game.milestones.filter((m) => !game.milestoneClaimed(m));
  }

  public static celebrate(player: IPlayer, milestone: IMilestone): void {
    if (milestone.canClaim(player)) {
      player.increaseTerraformRating(2, {log: true});
    }
    for (const opponent of player.opponents) {
      if (milestone.canClaim(opponent)) {
        opponent.increaseTerraformRating(1, {log: true});
      }
    }
  }

  public override bespokePlay(player: IPlayer) {
    const milestones = AwardCelebration.unclaimed(player);
    if (milestones.length === 0) {
      return undefined;
    }
    return new OrOptions(...milestones.map((milestone) =>
      new SelectOption(milestone.name).andThen(() => {
        player.game.log('/bin/bash celebrated ', (b) => b.player(player).milestone(milestone));
        AwardCelebration.celebrate(player, milestone);
        return undefined;
      }))).setTitle('Select an unclaimed milestone');
  }
}
