import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {CardType} from '../../../common/cards/CardType';
import {Card} from '../Card';
import {IActionCard, ICard, isIActionCard, isIHasCheckLoops} from '../ICard';
import {IPlayer} from '../../IPlayer';
import {IProjectCard} from '../IProjectCard';
import {SelectCard} from '../../inputs/SelectCard';
import {Tag} from '../../../common/cards/Tag';

export class AncientReplicatorTech extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.ANCIENT_REPLICATOR_TECH,
      tags: [],
      cost: 3,
      requirements: {tag: Tag.BUILDING, count: 2},
      victoryPoints: 1,
      behavior: {
        production: {energy: -1},
      },
      metadata: {
        cardNumber: 'E41',
        renderData: CardRenderer.builder((b) => {
          b.action('Use an action on another of your blue cards that you already used this generation.', (eb) => eb.empty().startAction.text('Action used').asterix()).br;
          b.production((pb) => pb.minus().energy(1));
        }),
        description: 'Requires 2 building tags. Decrease your energy production 1 step.',
      },
    });
  }

  private getActionCards(player: IPlayer): Array<IActionCard & ICard> {
    const result = [];
    for (const playedCard of player.tableau) {
      if (playedCard === this || !isIActionCard(playedCard)) {
        continue;
      }
      if (isIHasCheckLoops(playedCard) && playedCard.getCheckLoops() >= 2) {
        continue;
      }
      if (player.actionsThisGeneration.has(playedCard.name) && playedCard.canAct(player)) {
        result.push(playedCard);
      }
    }
    return result;
  }
  public canAct(player: IPlayer): boolean {
    return this.getActionCards(player).length > 0;
  }
  public action(player: IPlayer) {
    const cards = this.getActionCards(player);
    if (cards.length === 0) {
      return undefined;
    }
    return new SelectCard('Perform again an action from a played card', 'Take action', cards).andThen(([card]) => {
      player.game.log('${0} used ${1} action with ${2}', (b) => b.player(player).card(card).card(this));
      return card.action(player);
    });
  }
}
