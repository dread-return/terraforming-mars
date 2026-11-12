import {CardName} from '../../../common/cards/CardName';
import {CardType} from '../../../common/cards/CardType';
import {CardRenderer} from '../render/CardRenderer';
import {PostludeCard} from './PostludeCard';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderItemType} from '../../../common/cards/render/CardRenderItemType';
import {IPlayer} from '../../IPlayer';
import {postludeVp} from './PostludeCard';

export class FloatingThermalPlant extends PostludeCard {
  constructor() {
    super({
      name: CardName.FLOATING_THERMAL_PLANT,
      type: CardType.AUTOMATED,
      cost: 8,
      tags: [Tag.BUILDING],
      postludeKind: 'ocean',
      behavior: {production: {heat: 1}},
      victoryPoints: 'special',

      metadata: {
        cardNumber: 'L31',
        renderData: CardRenderer.builder((b) => {
          b.production((pb) => pb.heat(1));
        }),
        description: 'Place the Floating Thermal Plant tile on top of an ocean. Increase your heat production 1 step. Adjacency bonus: 1 heat. 1 VP for every 4 heat production you have.',
        victoryPoints: postludeVp(CardRenderItemType.HEAT, 1, 4, {production: true}),
      },
    });
  }


  public override getVictoryPoints(player: IPlayer): number {
    return Math.floor(player.production.heat / 4);
  }
}
