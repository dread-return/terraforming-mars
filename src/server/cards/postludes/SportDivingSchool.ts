import {CardName} from '../../../common/cards/CardName';
import {CardType} from '../../../common/cards/CardType';
import {CardRenderer} from '../render/CardRenderer';
import {PostludeCard} from './PostludeCard';
import {CardRenderItemType} from '../../../common/cards/render/CardRenderItemType';
import {IPlayer} from '../../IPlayer';
import {postludeVp} from './PostludeCard';

export class SportDivingSchool extends PostludeCard {
  constructor() {
    super({
      name: CardName.SPORT_DIVING_SCHOOL,
      type: CardType.AUTOMATED,
      cost: 8,
      tags: [],
      postludeKind: 'ocean',
      behavior: {production: {megacredits: 2}},
      victoryPoints: 'special',

      metadata: {
        cardNumber: 'L40',
        renderData: CardRenderer.builder((b) => {
          b.production((pb) => pb.megacredits(2));
        }),
        description: 'Place the Sport Diving School tile on top of an ocean. Increase your M\u20ac production 2 steps. Adjacency bonus: 2 M\u20ac. 1 VP for every adjacent city.',
        victoryPoints: postludeVp(CardRenderItemType.CITY, 1, 1, {asterisk: true}),
      },
    });
  }


  public override getVictoryPoints(player: IPlayer): number {
    return this.adjacentCityCount(player, true);
  }
}
