import {CardName} from '../../../common/cards/CardName';
import {CardType} from '../../../common/cards/CardType';
import {CardRenderer} from '../render/CardRenderer';
import {PostludeCard} from './PostludeCard';
import {Tag} from '../../../common/cards/Tag';
import {CardResource} from '../../../common/CardResource';
import {IPlayer} from '../../IPlayer';
import {Postludes} from '../../postludes/Postludes';
import {Space} from '../../boards/Space';

export class WaterRecycleComplex extends PostludeCard {
  constructor() {
    super({
      name: CardName.WATER_RECYCLE_COMPLEX,
      type: CardType.AUTOMATED,
      cost: 11,
      tags: [Tag.MICROBE],
      postludeKind: 'ocean',
      victoryPoints: {tag: Tag.MICROBE, per: 4},

      metadata: {
        cardNumber: 'L41',
        renderData: CardRenderer.builder((b) => {
          b.effect('Get 1 microbe for every microbe tag you own, including this. Adjacency bonus: 1 microbe.', (eb) => eb.empty().startEffect.resource(CardResource.MICROBE).slash().tag(Tag.MICROBE));
        }),
        description: 'Place the Water Recycle Complex tile on top of an ocean. Get 1 microbe for every microbe tag you own, including this. Adjacency bonus: 1 microbe. 1 VP for every 4 microbe tags you own.',
      },
    });
  }

  protected override onPlaced(player: IPlayer, _space: Space): void {
    const count = this.tagCount(player, Tag.MICROBE);
    if (count > 0) {
      Postludes.addResourceToAnyCard(player, CardResource.MICROBE, count);
    }
  }
}
