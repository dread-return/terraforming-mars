import {IProjectCard} from '../IProjectCard';
import {ICard, isIActionCard} from '../ICard';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Size} from '../../../common/cards/render/Size';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {PartyName} from '../../../common/turmoil/PartyName';
import {SelectCard} from '../../inputs/SelectCard';
import {message} from '../../logs/MessageBuilder';

const CARDS_PER_OPPONENT = 2;

/** H21. */
export class TerraformingBureauRestructuring extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.EVENT,
      name: CardName.TERRAFORMING_BUREAU_RESTRUCTURING,
      tags: [],
      cost: 0,
      victoryPoints: -1,
      requirements: {party: PartyName.BUREAUCRATS},

      metadata: {
        cardNumber: 'H21',
        renderData: CardRenderer.builder((b) => {
          b.text('Each opponent marks 2 of their action cards, of your choice, as used this generation.', {size: Size.SMALL, isBold: false});
        }),
        description: 'Requires that Bureaucrats are ruling or that you have 2 delegates there.',
      },
    });
  }

  /** The cards with an action `opponent` can still use this generation. */
  public static unusedActionCards(opponent: IPlayer): Array<ICard> {
    return opponent.tableau.asArray().filter((card) =>
      card.type === CardType.ACTIVE && isIActionCard(card) && !opponent.actionsThisGeneration.has(card.name));
  }

  public override bespokePlay(player: IPlayer) {
    for (const opponent of player.opponents) {
      player.defer(() => {
        const cards = TerraformingBureauRestructuring.unusedActionCards(opponent);
        if (cards.length === 0) {
          return undefined;
        }
        const count = Math.min(CARDS_PER_OPPONENT, cards.length);
        const mark = (chosen: ReadonlyArray<ICard>) => {
          for (const card of chosen) {
            opponent.actionsThisGeneration.add(card.name);
            player.game.log('${0} marked ${1} of ${2} as used', (b) => b.player(player).card(card).player(opponent));
          }
          return undefined;
        };
        if (cards.length <= count) {
          return mark(cards);
        }
        return new SelectCard(message('Select ${0} action cards of ${1} to mark as used', (b) => b.number(count).player(opponent)),
          'Mark', cards, {min: count, max: count}).andThen(mark);
      });
    }
    return undefined;
  }
}
