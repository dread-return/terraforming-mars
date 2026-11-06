import {IActionCard} from '../ICard';
import {IProjectCard} from '../IProjectCard';
import {Tag} from '../../../common/cards/Tag';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {PartyName} from '../../../common/turmoil/PartyName';
import {SelectCard} from '../../inputs/SelectCard';

export class WishMachine extends Card implements IActionCard, IProjectCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.WISH_MACHINE,
      tags: [Tag.SCIENCE],
      cost: 19,
      requirements: {party: PartyName.SCIENTISTS},
      victoryPoints: 1,

      metadata: {
        cardNumber: 'S28',
        renderData: CardRenderer.builder((b) => {
          b.action('Add 1 resource to any of your cards that already has at least 1 resource.', (eb) => {
            eb.empty().startAction.wild(1).asterix();
          });
        }),
        description: 'Requires that Scientists are ruling or that you have 2 delegates there.',
      },
    });
  }

  public canAct(player: IPlayer): boolean {
    return player.getCardsWithResources().length > 0;
  }

  public action(player: IPlayer) {
    const cards = player.getCardsWithResources();
    if (cards.length === 1) {
      player.addResourceTo(cards[0], {qty: 1, log: true});
      return undefined;
    }
    return new SelectCard('Select a card to add 1 resource to', 'Add resource', cards)
      .andThen(([card]) => {
        player.addResourceTo(card, {qty: 1, log: true});
        return undefined;
      });
  }
}
