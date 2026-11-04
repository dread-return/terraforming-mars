import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {IActionCard, ICard, isIActionCard, isIHasCheckLoops} from '../ICard';
import {SelectCard} from '../../inputs/SelectCard';

export class FamilyAdvertising extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.EVENT,
      name: CardName.FAMILY_ADVERTISING,
      cost: 5,

      metadata: {
        cardNumber: 'B37',
        renderData: CardRenderer.builder((b) => {
          b.text('2').cards(1).asterix();
        }),
        description: 'Use the actions of up to 2 of your cards again, even if they have been used this generation.',
      },
    });
  }

  // Same rules as Project Inspection: used this generation and currently usable.
  private getActionCards(player: IPlayer): Array<IActionCard & ICard> {
    const result: Array<IActionCard & ICard> = [];
    for (const card of player.tableau) {
      if (card === this || !isIActionCard(card)) {
        continue;
      }
      if (isIHasCheckLoops(card) && card.getCheckLoops() >= 2) {
        continue;
      }
      if (player.actionsThisGeneration.has(card.name) && card.canAct(player)) {
        result.push(card);
      }
    }
    return result;
  }

  public override bespokeCanPlay(player: IPlayer) {
    return this.getActionCards(player).length > 0;
  }

  public override bespokePlay(player: IPlayer) {
    const cards = this.getActionCards(player);
    if (cards.length === 0) {
      return undefined;
    }
    return new SelectCard<IActionCard & ICard>(
      'Select up to 2 cards whose actions to use again', 'Use actions', cards, {min: 1, max: Math.min(2, cards.length)})
      .andThen((selected) => {
        for (const card of selected) {
          player.defer(() => {
            if (!card.canAct(player)) {
              return undefined;
            }
            player.game.log('${0} used ${1} action with ${2}', (b) => b.player(player).card(card).card(this));
            return card.action(player);
          });
        }
        return undefined;
      });
  }
}
