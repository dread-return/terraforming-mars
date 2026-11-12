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

export class CloudGenerator extends PostludeCard {
  constructor() {
    super({
      name: CardName.CLOUD_GENERATOR,
      type: CardType.AUTOMATED,
      cost: 8,
      tags: [Tag.VENUS],
      postludeKind: 'ocean',
      victoryPoints: 'special',

      metadata: {
        cardNumber: 'L29',
        renderData: CardRenderer.builder((b) => {
          b.effect('Add a floater to any card for every Venus tag you own. Adjacency bonus: 1 floater.', (eb) => eb.empty().startEffect.resource(CardResource.FLOATER).slash().tag(Tag.VENUS));
        }),
        description: 'Place the Cloud Generator tile on top of an ocean. Add a floater to any card for every Venus tag you own. Adjacency bonus: 1 floater. 1 VP for every 4 floaters you have.',
        victoryPoints: postludeVp(CardRenderItemType.RESOURCE, 1, 4, {resource: CardResource.FLOATER}),
      },
    });
  }

  protected override onPlaced(player: IPlayer, _space: Space): void {
    const count = this.tagCount(player, Tag.VENUS);
    if (count > 0) {
      Postludes.addResourceToAnyCard(player, CardResource.FLOATER, count);
    }
  }

  public override getVictoryPoints(player: IPlayer): number {
    return Math.floor(player.getResourceCount(CardResource.FLOATER) / 4);
  }
}
