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

export class CultivationBiodome extends PostludeCard implements IActionCard {
  constructor() {
    super({
      name: CardName.CULTIVATION_BIODOME,
      type: CardType.ACTIVE,
      cost: 16,
      tags: [Tag.PLANT, Tag.BUILDING],
      postludeKind: 'greenery',
      victoryPoints: 'special',

      metadata: {
        cardNumber: 'L21',
        renderData: CardRenderer.builder((b) => {
          b.action('Get a plant for every ocean adjacent to the Cultivation Biodome.', (ab) => ab.empty().startAction.plants(1).slash().oceans(1, {size: Size.SMALL}).asterix());
        }),
        description: 'Place the Cultivation Biodome tile on top of one of your greeneries. Action: get a plant for every ocean adjacent to the Cultivation Biodome. 1 VP for every adjacent ocean.',
        victoryPoints: postludeVp(CardRenderItemType.OCEANS, 1, 1, {asterisk: true}),
      },
    });
  }

  public canAct(player: IPlayer): boolean {
    return this.adjacentOceans(player).length > 0;
  }

  public action(player: IPlayer) {
    player.stock.add(Resource.PLANTS, this.adjacentOceans(player).length, {log: true});
    return undefined;
  }

  public override getVictoryPoints(player: IPlayer): number {
    return this.adjacentOceans(player).length;
  }
}
