import {CardName} from '../../../common/cards/CardName';
import {CardType} from '../../../common/cards/CardType';
import {CardRenderer} from '../render/CardRenderer';
import {PostludeCard} from './PostludeCard';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderItemType} from '../../../common/cards/render/CardRenderItemType';
import {CardResource} from '../../../common/CardResource';
import {IPlayer} from '../../IPlayer';
import {Postludes} from '../../postludes/Postludes';
import {Space} from '../../boards/Space';
import {postludeVp} from './PostludeCard';

export class SeaOrbiter extends PostludeCard {
  constructor() {
    super({
      name: CardName.SEA_ORBITER,
      type: CardType.AUTOMATED,
      cost: 7,
      tags: [Tag.MARS],
      postludeKind: 'ocean',
      victoryPoints: 'special',

      metadata: {
        cardNumber: 'L38',
        renderData: CardRenderer.builder((b) => {
          b.effect('Get 1 data for every Mars tag you own, including this. Adjacency bonus: 1 data.', (eb) => eb.empty().startEffect.resource(CardResource.DATA).slash().tag(Tag.MARS));
        }),
        description: 'Place the Sea Orbiter tile on top of an ocean. Get 1 data for every Mars tag you own, including this. Adjacency bonus: 1 data. 1 VP for every 4 data you have.',
        victoryPoints: postludeVp(CardRenderItemType.RESOURCE, 1, 4, {resource: CardResource.DATA}),
      },
    });
  }

  protected override onPlaced(player: IPlayer, _space: Space): void {
    const count = this.tagCount(player, Tag.MARS);
    if (count > 0) {
      Postludes.addResourceToAnyCard(player, CardResource.DATA, count);
    }
  }

  public override getVictoryPoints(player: IPlayer): number {
    return Math.floor(player.getResourceCount(CardResource.DATA) / 4);
  }
}
