import {CardName} from '../../../common/cards/CardName';
import {CardType} from '../../../common/cards/CardType';
import {CardRenderer} from '../render/CardRenderer';
import {PostludeCard} from './PostludeCard';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderItemType} from '../../../common/cards/render/CardRenderItemType';
import {IPlayer} from '../../IPlayer';
import {postludeVp} from './PostludeCard';

export class HydraulicPowerPlant extends PostludeCard {
  constructor() {
    super({
      name: CardName.HYDRAULIC_POWER_PLANT,
      type: CardType.AUTOMATED,
      cost: 9,
      tags: [Tag.POWER],
      postludeKind: 'ocean',
      behavior: {production: {energy: 1}},
      victoryPoints: 'special',

      metadata: {
        cardNumber: 'L32',
        renderData: CardRenderer.builder((b) => {
          b.production((pb) => pb.energy(1));
        }),
        description: 'Place the Hydraulic Power Plant tile on top of an ocean. Increase your energy production 1 step. Adjacency bonus: 1 energy. 1 VP for every 4 energy production you have.',
        victoryPoints: postludeVp(CardRenderItemType.ENERGY, 1, 4, {production: true}),
      },
    });
  }


  public override getVictoryPoints(player: IPlayer): number {
    return Math.floor(player.production.energy / 4);
  }
}
