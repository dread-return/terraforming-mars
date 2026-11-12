import {CardName} from '../../../common/cards/CardName';
import {CardType} from '../../../common/cards/CardType';
import {CardRenderer} from '../render/CardRenderer';
import {PostludeCard} from './PostludeCard';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderItemType} from '../../../common/cards/render/CardRenderItemType';
import {IPlayer} from '../../IPlayer';
import {postludeVp} from './PostludeCard';

export class UnderwaterResort extends PostludeCard {
  constructor() {
    super({
      name: CardName.UNDERWATER_RESORT,
      type: CardType.AUTOMATED,
      cost: 9,
      tags: [Tag.EARTH],
      postludeKind: 'ocean',
      behavior: {production: {megacredits: 2}},
      victoryPoints: 'special',

      metadata: {
        cardNumber: 'L39',
        renderData: CardRenderer.builder((b) => {
          b.production((pb) => pb.megacredits(2));
        }),
        description: 'Place the Underwater Resort tile on top of an ocean. Increase your M\u20ac production 2 steps. Adjacency bonus: 2 M\u20ac. 1 VP for every adjacent greenery.',
        victoryPoints: postludeVp(CardRenderItemType.GREENERY, 1, 1, {asterisk: true}),
      },
    });
  }


  public override getVictoryPoints(player: IPlayer): number {
    return this.adjacentGreeneryCount(player, {forScoring: true});
  }
}
