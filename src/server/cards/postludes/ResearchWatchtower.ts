import {CardName} from '../../../common/cards/CardName';
import {CardType} from '../../../common/cards/CardType';
import {CardRenderer} from '../render/CardRenderer';
import {PostludeCard} from './PostludeCard';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderItemType} from '../../../common/cards/render/CardRenderItemType';
import {IPlayer} from '../../IPlayer';
import {Space} from '../../boards/Space';
import {postludeVp} from './PostludeCard';

export class ResearchWatchtower extends PostludeCard {
  constructor() {
    super({
      name: CardName.RESEARCH_WATCHTOWER,
      type: CardType.AUTOMATED,
      cost: 14,
      tags: [Tag.SCIENCE],
      postludeKind: 'ocean',
      victoryPoints: 'special',

      metadata: {
        cardNumber: 'L37',
        renderData: CardRenderer.builder((b) => {
          b.cards(2);
        }),
        description: 'Place the Research Watchtower tile on top of an ocean. Draw 2 cards. Adjacency bonus: 1 card. 1 VP for every 10 cards you played.',
        victoryPoints: postludeVp(CardRenderItemType.CARDS, 1, 10),
      },
    });
  }

  protected override onPlaced(player: IPlayer, _space: Space): void {
    player.drawCard(2);
  }

  public override getVictoryPoints(player: IPlayer): number {
    return Math.floor(player.playedCards.length / 10);
  }
}
