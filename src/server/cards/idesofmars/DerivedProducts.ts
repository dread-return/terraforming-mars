import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';

export class DerivedProducts extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.AUTOMATED,
      name: CardName.DERIVED_PRODUCTS,
      tags: [Tag.EARTH],
      cost: 4,
      requirements: {display: 'cardVP', count: 3},

      behavior: {
        production: {megacredits: 2},
      },

      metadata: {
        cardNumber: 'I46',
        renderData: CardRenderer.builder((b) => {
          b.production((pb) => pb.megacredits(2));
        }),
        description: 'Requires that you have at least 3 VP on your cards. Increase your M€ production 2 steps.',
      },
    });
  }

  public static victoryPointsOnCards(player: IPlayer): number {
    let total = 0;
    for (const card of player.tableau) {
      if (card.victoryPoints !== undefined) {
        total += card.getVictoryPoints(player);
      }
    }
    return total;
  }

  public override bespokeCanPlay(player: IPlayer) {
    return DerivedProducts.victoryPointsOnCards(player) >= 3;
  }
}
