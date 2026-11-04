import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {IMilestone} from '../../milestones/IMilestone';
import {OrOptions} from '../../inputs/OrOptions';
import {SelectOption} from '../../inputs/SelectOption';
import {Resource} from '../../../common/Resource';

export class MonopolyBreakup extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.EVENT,
      name: CardName.MONOPOLY_BREAKUP,
      cost: 5,

      metadata: {
        cardNumber: 'B30',
        renderData: CardRenderer.builder((b) => {
          b.milestone().asterix();
        }),
        description: 'Requires that another player has a TR at least 10 steps higher than yours. ' +
          'Claim an unclaimed milestone you qualify for, for free, even if the milestone limit has been reached.',
      },
    });
  }

  private claimable(player: IPlayer): Array<IMilestone> {
    const game = player.game;
    return game.milestones.filter((m) => !game.milestoneClaimed(m) && m.canClaim(player));
  }

  public override bespokeCanPlay(player: IPlayer) {
    const behind = player.opponents.some((o) => o.terraformRating >= player.terraformRating + 10);
    return behind && this.claimable(player).length > 0;
  }

  public override bespokePlay(player: IPlayer) {
    const options = this.claimable(player).map((milestone) =>
      new SelectOption(milestone.name, 'Claim').andThen(() => {
        this.claim(player, milestone);
        return undefined;
      }));
    if (options.length === 0) {
      return undefined;
    }
    return new OrOptions(...options).setTitle('Select a milestone to claim for free');
  }

  private claim(player: IPlayer, milestone: IMilestone) {
    const game = player.game;
    game.log('${0} claimed ${1} milestone with ${2}', (b) => b.player(player).milestone(milestone).card(this));
    game.claimedMilestones.push({player, milestone});
    // Mirrors the VanAllen CEO hook in Player.claimMilestone.
    const vanAllen = game.getCardPlayerOrUndefined(CardName.VANALLEN);
    if (vanAllen !== undefined) {
      vanAllen.stock.add(Resource.MEGACREDITS, 3, {log: true, from: {card: CardName.VANALLEN}});
    }
  }
}
