import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {CardType} from '../../../common/cards/CardType';
import {Card} from '../Card';
import {IPlayer} from '../../IPlayer';
import {IProjectCard} from '../IProjectCard';
import {SelectCard} from '../../inputs/SelectCard';
import {SelectPaymentDeferred} from '../../deferredActions/SelectPaymentDeferred';
import {Size} from '../../../common/cards/render/Size';
import {Tag} from '../../../common/cards/Tag';

export class Wormhole extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.WORMHOLE,
      tags: [Tag.SCIENCE, Tag.SPACE],
      cost: 7,
      requirements: [{tag: Tag.SCIENCE}, {tag: Tag.SPACE}],
      victoryPoints: 1,
      metadata: {
        cardNumber: 'E142',
        renderData: CardRenderer.builder((b) => {
          b.action('Pay 4 M€ plus the cost of one of your played events to play it again. Then remove it from the game.', (eb) => {
            eb.megacredits(4).plus().megacredits(0, {text: '?'}).startAction.text('replay event', {size: Size.SMALL});
          });
        }),
        description: 'Requires a science tag and a space tag.',
      },
    });
  }

  private events(player: IPlayer): Array<IProjectCard> {
    return player.playedCards.projects().filter((c) => c.type === CardType.EVENT && player.canAfford(4 + c.cost) &&
      c.canPlayPostRequirements(player, {cost: 4 + c.cost}));
  }
  public canAct(player: IPlayer): boolean {
    return this.events(player).length > 0;
  }
  public action(player: IPlayer) {
    return new SelectCard('Select an event to play again', 'Replay', this.events(player)).andThen(([event]) => {
      player.game.defer(new SelectPaymentDeferred(player, 4 + event.cost, {title: 'Pay 4 M€ plus the event\'s cost'}).andThen(() => {
        player.playedCards.remove(event);
        player.removedFromPlayCards.push(event);
        player.playCard(event, undefined, 'nothing');
        player.game.log('${0} removed ${1} from the game', (b) => b.player(player).card(event));
      }));
      return undefined;
    });
  }
}
