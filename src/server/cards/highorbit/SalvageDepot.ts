import {CardName} from '../../../common/cards/CardName';
import {Resource} from '../../../common/Resource';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {IActionCard} from '../ICard';
import {InfrastructureCard} from './InfrastructureCard';

export class SalvageDepot extends InfrastructureCard implements IActionCard {
  constructor(copy: number = 1) {
    super(CardName.SALVAGE_DEPOT, copy, {
      metadata: {
        cardNumber: 'HO43',
        renderData: CardRenderer.builder((b) => {
          b.action('Spend 1 energy to shuffle the discard pile and draw 1 card from it.', (eb) => eb.energy(1).startAction.cards(1).asterix());
        }),
      },
    });
  }

  public canAct(player: IPlayer): boolean {
    return player.energy >= 1 && player.game.projectDeck.discardPile.length > 0;
  }

  public action(player: IPlayer) {
    const deck = player.game.projectDeck;
    player.stock.deduct(Resource.ENERGY, 1);
    deck.shuffleDiscardPile();
    const card = deck.discardPile.pop();
    if (card !== undefined) {
      player.cardsInHand.push(card);
      player.game.log('${0} drew a card from the discard pile with ${1}', (b) => b.player(player).card(this));
    }
    return undefined;
  }
}
