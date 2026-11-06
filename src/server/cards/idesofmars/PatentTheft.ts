import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {IActionCard, ICard, isIActionCard} from '../ICard';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardResource} from '../../../common/CardResource';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {SelectCard} from '../../inputs/SelectCard';

export class PatentTheft extends Card implements IProjectCard, IActionCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.PATENT_THEFT,
      tags: [Tag.EARTH],
      cost: 2,
      resourceType: CardResource.LOOT,
      victoryPoints: {resourcesHere: {}, per: 2, each: -1},

      metadata: {
        cardNumber: 'I05',
        renderData: CardRenderer.builder((b) => {
          b.action('Use the action of an active card an opponent owns, and add 1 loot to this card.', (eb) => {
            eb.empty().startAction.text('opp. action').asterix().nbsp.resource(CardResource.LOOT);
          }).br;
          b.vpText('-1 VP for every 2 loot on this card.');
        }),
      },
    });
  }

  /** Opponents' blue cards whose action `player` could use now. */
  private stealableCards(player: IPlayer): Array<ICard & IActionCard> {
    const result: Array<ICard & IActionCard> = [];
    for (const opponent of player.opponents) {
      for (const card of opponent.playedCards) {
        if (card.type !== CardType.ACTIVE || card.name === this.name || card.isDisabled === true) {
          continue;
        }
        if (isIActionCard(card) && card.canAct(player)) {
          result.push(card);
        }
      }
    }
    return result;
  }

  public canAct(player: IPlayer) {
    return this.stealableCards(player).length > 0;
  }

  public action(player: IPlayer) {
    return new SelectCard('Select an opponent\'s card to use its action', 'Use action', this.stealableCards(player), {showOwner: true})
      .andThen(([card]) => {
        player.game.log('${0} used the action of ${1} (${2})', (b) => b.player(player).card(card).card(this));
        player.addResourceTo(this, {qty: 1, log: true});
        return card.action(player);
      });
  }
}
