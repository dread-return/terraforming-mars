import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {IActionCard} from '../ICard';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {SelectCard} from '../../inputs/SelectCard';

export class UnderwaterOutpost extends Card implements IProjectCard, IActionCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.UNDERWATER_OUTPOST,
      tags: [Tag.SCIENCE, Tag.BUILDING],
      cost: 27,
      requirements: {oceans: 2},
      victoryPoints: 2,

      metadata: {
        cardNumber: 'B05',
        renderData: CardRenderer.builder((b) => {
          b.action('Draw 2 cards, then discard a card.', (eb) => {
            eb.empty().startAction.cards(2).nbsp.minus().cards(1);
          });
        }),
        description: 'Requires 2 ocean tiles.',
      },
    });
  }

  public canAct(): boolean {
    return true;
  }

  public action(player: IPlayer) {
    player.drawCard(2);
    player.defer(() => {
      if (player.cardsInHand.length === 0) {
        return undefined;
      }
      return new SelectCard('Select a card to discard', 'Discard', player.cardsInHand)
        .andThen(([card]) => {
          player.discardCardFromHand(card, {log: true});
          return undefined;
        });
    });
    return undefined;
  }
}
