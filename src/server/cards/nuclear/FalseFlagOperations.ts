import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {IActionCard} from '../ICard';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {OrOptions} from '../../inputs/OrOptions';
import {SelectOption} from '../../inputs/SelectOption';
import {FALSE_FLAG_CIRCLED_TAGS, FALSE_FLAG_TAGS} from './Nuclear';
import {message} from '../../logs/MessageBuilder';

/** The cost penalty is applied by Nuclear.cardCostAdjustment. */
export class FalseFlagOperations extends Card implements IProjectCard, IActionCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.FALSE_FLAG_OPERATIONS,
      tags: [Tag.EARTH],
      cost: 3,

      metadata: {
        cardNumber: 'N69',
        renderData: CardRenderer.builder((b) => {
          b.action('Put your marker on one of these tags. When opponents play a card with that tag, they pay 1 M€ more. ' +
            'The circled tags (space, science, building) apply to all players.', (eb) => {
            eb.empty().startAction.tag(Tag.SPACE).tag(Tag.SCIENCE).tag(Tag.BUILDING).tag(Tag.JOVIAN).tag(Tag.EARTH).tag(Tag.POWER).colon().megacredits(1);
          });
        }),
        description: 'Requires that you own at least 15 tags.',
      },
    });
  }

  public data: {tag?: Tag} = {};

  public static ownTags(player: IPlayer): number {
    const counts = player.tags.countAllTags();
    return Object.entries(counts).reduce((sum, [tag, count]) => tag === Tag.EVENT ? sum : sum + count, 0);
  }

  public override bespokeCanPlay(player: IPlayer) {
    return FalseFlagOperations.ownTags(player) >= 15;
  }

  public canAct(): boolean {
    return true;
  }

  public action(player: IPlayer) {
    return new OrOptions(...FALSE_FLAG_TAGS.map((tag) => {
      const label = FALSE_FLAG_CIRCLED_TAGS.includes(tag) ? 'Mark ${0} (all players)' : 'Mark ${0} (opponents)';
      return new SelectOption(message(label, (b) => b.string(tag))).andThen(() => {
        this.data = {tag};
        player.game.log('${0} marked the ${1} tag with ${2}', (b) => b.player(player).string(tag).cardName(this.name));
        return undefined;
      });
    })).setTitle('Select a tag to mark');
  }
}
