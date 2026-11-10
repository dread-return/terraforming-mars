import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {CardType} from '../../../common/cards/CardType';
import {Card} from '../Card';
import {ICard} from '../ICard';
import {IPlayer} from '../../IPlayer';
import {IProjectCard} from '../IProjectCard';
import {SelectCard} from '../../inputs/SelectCard';
import {SelectPaymentDeferred} from '../../deferredActions/SelectPaymentDeferred';
import {Size} from '../../../common/cards/render/Size';
import {Tag} from '../../../common/cards/Tag';
import {isIActionCard, IActionCard} from '../ICard';

export class IdentityDatabase extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.IDENTITY_DATABASE,
      tags: [Tag.EARTH],
      cost: 2,
      requirements: {tag: Tag.EARTH, count: 2},
      behavior: {
        production: {energy: -1},
      },
      metadata: {
        cardNumber: 'E77',
        renderData: CardRenderer.builder((b) => {
          b.action('Pay 3 M€ to use an action on one of your opponents\' blue cards (paying its cost).', (eb) => {
            eb.megacredits(3).startAction.text('opponent\'s action', {size: Size.SMALL});
          }).br;
          b.production((pb) => pb.minus().energy(1));
        }),
        description: 'Requires 2 Earth tags. Decrease your energy production 1 step.',
      },
    });
  }

  private targets(player: IPlayer): Array<ICard & IActionCard> {
    if (player.megaCredits < 3) {
      return [];
    }
    const out: Array<ICard & IActionCard> = [];
    player.megaCredits -= 3; // canAct is checked as if the 3 M€ were already paid.
    try {
      for (const opponent of player.opponents) {
        for (const card of opponent.playedCards) {
          if (card.type !== CardType.ACTIVE || card.name === this.name || !isIActionCard(card)) {
            continue;
          }
          try {
            if (card.canAct(player)) {
              out.push(card);
            }
          } catch (e) {
            // Some actions assume they belong to their owner; skip them.
          }
        }
      }
    } finally {
      player.megaCredits += 3;
    }
    return out;
  }
  public canAct(player: IPlayer): boolean {
    return this.targets(player).length > 0;
  }
  public action(player: IPlayer) {
    return new SelectCard('Select an opponent\'s blue card action to use', 'Use', this.targets(player), {selectBlueCardAction: true}).andThen(([card]) => {
      player.game.defer(new SelectPaymentDeferred(player, 3, {title: 'Pay 3 M€ for Identity Database'}).andThen(() => {
        player.game.log('${0} used the action of ${1}', (b) => b.player(player).card(card));
        player.defer(card.action(player));
      }));
      return undefined;
    });
  }
}
