import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {CardType} from '../../../common/cards/CardType';
import {Card} from '../Card';
import {IPlayer} from '../../IPlayer';
import {IProjectCard} from '../IProjectCard';
import {OrOptions} from '../../inputs/OrOptions';
import {SelectOption} from '../../inputs/SelectOption';

export class AwardFunding extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.EVENT,
      name: CardName.AWARD_FUNDING,
      tags: [],
      cost: 10,
      metadata: {
        cardNumber: 'E47',
        renderData: CardRenderer.builder((b) => {
          b.award().asterix().text('free');
        }),
        description: 'Fund an award for free, if possible.',
      },
    });
  }

  private available(player: IPlayer) {
    const game = player.game;
    if (game.allAwardsFunded()) {
      return [];
    }
    return game.awards.filter((a) => !game.fundedAwards.some((f) => f.award === a));
  }
  public override bespokeCanPlay(player: IPlayer) {
    return this.available(player).length > 0;
  }
  public override bespokePlay(player: IPlayer) {
    return new OrOptions(...this.available(player).map((award) => new SelectOption(award.name).andThen(() => {
      player.game.fundAward(player, award);
      return undefined;
    }))).setTitle('Fund an award for free');
  }
}
