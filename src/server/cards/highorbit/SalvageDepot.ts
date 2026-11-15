import {CardName} from '../../../common/cards/CardName';
import {CardResource} from '../../../common/CardResource';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {IActionCard} from '../ICard';
import {IProjectCard} from '../IProjectCard';
import {SelectCard} from '../../inputs/SelectCard';
import {AddResourcesToCard} from '../../deferredActions/AddResourcesToCard';
import {InfrastructureCard} from './InfrastructureCard';
import {HighOrbit} from '../../highOrbit/HighOrbit';

/**
 * Action: discard any number of cards from your hand to add that many ore to any card.
 * Effect (HighOrbit's discard listener): when project cards are discarded during the action phase, you may spend
 * 1 ore here to draw one of them at random.
 */
export class SalvageDepot extends InfrastructureCard implements IActionCard {
  constructor(copy: number = 1) {
    super(CardName.SALVAGE_DEPOT, copy, {
      resourceType: CardResource.ORE,
      metadata: {
        cardNumber: 'INF13',
        renderData: CardRenderer.builder((b) => {
          b.action('Discard X cards to add X ore to any card.', (eb) => {
            eb.text('-X').cards(1).startAction.text('X').resource(CardResource.ORE).asterix();
          }).br;
          b.effect('When anyone discards cards, you may spend 1 ore here to draw 1 at random.', (eb) => {
            eb.text('discard').startEffect.minus().resource(CardResource.ORE).colon().cards(1).asterix();
          });
        }),
      },
    });
  }

  public canAct(player: IPlayer): boolean {
    return player.cardsInHand.length > 0;
  }

  public action(player: IPlayer) {
    return new SelectCard<IProjectCard>('Select the cards to discard', 'Discard', player.cardsInHand, {min: 1, max: player.cardsInHand.length})
      .andThen((cards) => {
        // Its own discards don't trigger Salvage Depot.
        HighOrbit.withoutSalvage(() => {
          for (const card of cards) {
            player.discardCardFromHand(card, {log: true});
          }
        });
        player.game.defer(new AddResourcesToCard(player, CardResource.ORE, {count: cards.length}));
        return undefined;
      });
  }
}
