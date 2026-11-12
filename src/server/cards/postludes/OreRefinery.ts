import {CardName} from '../../../common/cards/CardName';
import {CardType} from '../../../common/cards/CardType';
import {CardRenderer} from '../render/CardRenderer';
import {PostludeCard} from './PostludeCard';
import {CardRenderItemType} from '../../../common/cards/render/CardRenderItemType';
import {IPlayer} from '../../IPlayer';
import {Space} from '../../boards/Space';
import {postludeVp} from './PostludeCard';

export class OreRefinery extends PostludeCard {
  constructor() {
    super({
      name: CardName.ORE_REFINERY,
      type: CardType.AUTOMATED,
      cost: 7,
      tags: [],
      postludeKind: 'ocean',
      victoryPoints: 'special',

      metadata: {
        cardNumber: 'L36',
        renderData: CardRenderer.builder((b) => {
          b.effect('Get 1 ore for every Infrastructure tag you own, including this. Adjacency bonus: 1 ore.', (eb) => eb.empty().startEffect.steel(1).slash().text('infrastructure'));
        }),
        description: 'Place the Ore Refinery tile on top of an ocean. Get 1 ore for every Infrastructure tag you own, including this. Adjacency bonus: 1 ore. 1 VP for every 4 ore resources you have. (Not dealt yet: it needs the Infrastructure tag.)',
        victoryPoints: postludeVp(CardRenderItemType.STEEL, 1, 4),
      },
    });
  }

  protected override onPlaced(_player: IPlayer, _space: Space): void {
    // The Infrastructure tag comes with High Orbit, so there is nothing to count yet.
  }

  public override getVictoryPoints(player: IPlayer): number {
    return Math.floor(player.steel / 4);
  }
}
