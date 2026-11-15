import {CardName} from '../../../common/cards/CardName';
import {CardResource} from '../../../common/CardResource';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {IActionCard, ICard} from '../ICard';
import {SelectCard} from '../../inputs/SelectCard';
import {SelectAmount} from '../../inputs/SelectAmount';
import {message} from '../../logs/MessageBuilder';
import {InfrastructureCard} from './InfrastructureCard';

/**
 * Action: move X ore from one of your cards and add X+1 ore to another one.
 * Effect (HighOrbit.freightersBeforeTrade): when you trade, you may spend 1 ore here to raise that colony's track
 * 1 step first. Needs Colonies (it is only dealt with Colonies).
 */
export class Freighters extends InfrastructureCard implements IActionCard {
  constructor(copy: number = 1) {
    super(CardName.FREIGHTERS, copy, {
      resourceType: CardResource.ORE,
      metadata: {
        cardNumber: 'INF10',
        renderData: CardRenderer.builder((b) => {
          b.action('Spend X ore from any of your cards to add X+1 ore to another card.', (eb) => {
            eb.text('X').resource(CardResource.ORE).startAction.text('X+1').resource(CardResource.ORE).asterix();
          }).br;
          b.effect('When you trade, you may spend 1 ore here to raise that colony\'s track 1 step.', (eb) => {
            eb.trade().resource(CardResource.ORE).startEffect.text('+1').colonies(1);
          });
        }),
      },
    });
  }

  private sources(player: IPlayer): Array<ICard> {
    return player.getResourceCards(CardResource.ORE).filter((card) => card.resourceCount > 0);
  }

  public canAct(player: IPlayer): boolean {
    return this.sources(player).length > 0 && player.getResourceCards(CardResource.ORE).length >= 2;
  }

  public action(player: IPlayer) {
    return new SelectCard('Select the card to take ore from', 'Take ore', this.sources(player))
      .andThen(([source]) => {
        return new SelectAmount(message('How much ore to take from ${0}?', (b) => b.card(source)), 'Take', 1, source.resourceCount, true)
          .andThen((x) => {
            const targets = player.getResourceCards(CardResource.ORE).filter((card) => card !== source);
            return new SelectCard(message('Select the card that gets ${0} ore', (b) => b.number(x + 1)), 'Add ore', targets)
              .andThen(([target]) => {
                player.removeResourceFrom(source, x, {log: true});
                player.addResourceTo(target, {qty: x + 1, log: true});
                return undefined;
              });
          });
      });
  }
}
