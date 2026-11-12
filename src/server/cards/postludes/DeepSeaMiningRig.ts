import {CardName} from '../../../common/cards/CardName';
import {CardType} from '../../../common/cards/CardType';
import {CardRenderer} from '../render/CardRenderer';
import {PostludeCard} from './PostludeCard';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderItemType} from '../../../common/cards/render/CardRenderItemType';
import {IPlayer} from '../../IPlayer';
import {postludeVp} from './PostludeCard';

export class DeepSeaMiningRig extends PostludeCard {
  constructor() {
    super({
      name: CardName.DEEP_SEA_MINING_RIG,
      type: CardType.AUTOMATED,
      cost: 10,
      tags: [Tag.BUILDING],
      postludeKind: 'ocean',
      behavior: {production: {steel: 1}},
      victoryPoints: 'special',

      metadata: {
        cardNumber: 'L30',
        renderData: CardRenderer.builder((b) => {
          b.production((pb) => pb.steel(1));
        }),
        description: 'Place the Mining Rig tile on top of an ocean. Increase your steel production 1 step. Adjacency bonus: 1 steel. 1 VP for every 4 steel production you have.',
        victoryPoints: postludeVp(CardRenderItemType.STEEL, 1, 4, {production: true}),
      },
    });
  }


  public override getVictoryPoints(player: IPlayer): number {
    return Math.floor(player.production.steel / 4);
  }
}
