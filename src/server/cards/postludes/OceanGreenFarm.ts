import {CardName} from '../../../common/cards/CardName';
import {CardType} from '../../../common/cards/CardType';
import {CardRenderer} from '../render/CardRenderer';
import {PostludeCard} from './PostludeCard';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderItemType} from '../../../common/cards/render/CardRenderItemType';
import {IPlayer} from '../../IPlayer';
import {postludeVp} from './PostludeCard';

export class OceanGreenFarm extends PostludeCard {
  constructor() {
    super({
      name: CardName.OCEAN_GREEN_FARM,
      type: CardType.AUTOMATED,
      cost: 11,
      tags: [Tag.PLANT],
      postludeKind: 'ocean',
      behavior: {production: {plants: 1}},
      victoryPoints: 'special',

      metadata: {
        cardNumber: 'L35',
        renderData: CardRenderer.builder((b) => {
          b.production((pb) => pb.plants(1));
        }),
        description: 'Place the Oceanic Green Farm tile on top of an ocean. Increase your plant production 1 step. Adjacency bonus: 1 plant. 1 VP for every 4 plant production you have.',
        victoryPoints: postludeVp(CardRenderItemType.PLANTS, 1, 4, {production: true}),
      },
    });
  }


  public override getVictoryPoints(player: IPlayer): number {
    return Math.floor(player.production.plants / 4);
  }
}
