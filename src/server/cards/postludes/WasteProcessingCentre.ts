import {CardName} from '../../../common/cards/CardName';
import {CardType} from '../../../common/cards/CardType';
import {CardRenderer} from '../render/CardRenderer';
import {PostludeCard} from './PostludeCard';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderItemType} from '../../../common/cards/render/CardRenderItemType';
import {IActionCard} from '../ICard';
import {IPlayer} from '../../IPlayer';
import {Resource} from '../../../common/Resource';
import {Size} from '../../../common/cards/render/Size';
import {postludeVp} from './PostludeCard';

export class WasteProcessingCentre extends PostludeCard implements IActionCard {
  constructor() {
    super({
      name: CardName.WASTE_PROCESSING_CENTRE,
      type: CardType.ACTIVE,
      cost: 12,
      tags: [Tag.POWER, Tag.BUILDING],
      postludeKind: 'greenery',
      victoryPoints: 'special',

      metadata: {
        cardNumber: 'L26',
        renderData: CardRenderer.builder((b) => {
          b.action('Get 3 heat for every city adjacent to the Waste Processing Centre.', (ab) => ab.empty().startAction.heat(3).slash().city({size: Size.SMALL}).asterix());
        }),
        description: 'Place the Waste Processing Centre on top of one of your greeneries. Action: get 3 heat for every city adjacent to the Waste Processing Centre. 1 VP for every adjacent city.',
        victoryPoints: postludeVp(CardRenderItemType.CITY, 1, 1, {asterisk: true}),
      },
    });
  }

  public canAct(player: IPlayer): boolean {
    return this.adjacentCityCount(player) > 0;
  }

  public action(player: IPlayer) {
    player.stock.add(Resource.HEAT, 3 * this.adjacentCityCount(player), {log: true});
    return undefined;
  }

  public override getVictoryPoints(player: IPlayer): number {
    return this.adjacentCityCount(player, true);
  }
}
