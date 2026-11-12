import {CardName} from '../../../common/cards/CardName';
import {CardType} from '../../../common/cards/CardType';
import {CardRenderer} from '../render/CardRenderer';
import {PostludeCard} from './PostludeCard';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderItemType} from '../../../common/cards/render/CardRenderItemType';
import {IPlayer} from '../../IPlayer';
import {Size} from '../../../common/cards/render/Size';
import {postludeVp} from './PostludeCard';

export class AmusementPark extends PostludeCard {
  constructor() {
    super({
      name: CardName.AMUSEMENT_PARK,
      type: CardType.ACTIVE,
      cost: 8,
      tags: [Tag.EARTH, Tag.BUILDING],
      postludeKind: 'greenery',
      victoryPoints: 'special',

      metadata: {
        cardNumber: 'L19',
        renderData: CardRenderer.builder((b) => {
          b.effect('You get double placement bonus from areas adjacent to the Amusement Park.', (eb) => eb.emptyTile('normal', {size: Size.SMALL}).asterix().startEffect.text('2X'));
        }),
        description: 'Place the Amusement Park tile on top of one of your greeneries. Effect: you get the placement bonus twice for tiles you place on areas adjacent to the Amusement Park. 1 VP for every adjacent city.',
        victoryPoints: postludeVp(CardRenderItemType.CITY, 1, 1, {asterisk: true}),
      },
    });
  }

  public override getVictoryPoints(player: IPlayer): number {
    return this.adjacentCityCount(player, true);
  }
}
