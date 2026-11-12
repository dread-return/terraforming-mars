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

export class PhotobionicPowerStation extends PostludeCard implements IActionCard {
  constructor() {
    super({
      name: CardName.PHOTOBIONIC_POWER_STATION,
      type: CardType.ACTIVE,
      cost: 9,
      tags: [Tag.PLANT, Tag.POWER],
      postludeKind: 'greenery',
      victoryPoints: 'special',

      metadata: {
        cardNumber: 'L22',
        renderData: CardRenderer.builder((b) => {
          b.action('Get an energy for every greenery adjacent to the Photobionic Power Station.', (ab) => ab.empty().startAction.energy(1).slash().greenery({size: Size.SMALL}).asterix());
        }),
        description: 'Place the Power Station tile on top of one of your greeneries. Action: get an energy for every greenery adjacent to the Photobionic Power Station. 1 VP for every adjacent greenery.',
        victoryPoints: postludeVp(CardRenderItemType.GREENERY, 1, 1, {asterisk: true}),
      },
    });
  }

  public canAct(player: IPlayer): boolean {
    return this.adjacentGreeneryCount(player) > 0;
  }

  public action(player: IPlayer) {
    player.stock.add(Resource.ENERGY, this.adjacentGreeneryCount(player), {log: true});
    return undefined;
  }

  public override getVictoryPoints(player: IPlayer): number {
    return this.adjacentGreeneryCount(player, {forScoring: true});
  }
}
