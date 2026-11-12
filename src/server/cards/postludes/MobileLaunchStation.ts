import {CardName} from '../../../common/cards/CardName';
import {CardType} from '../../../common/cards/CardType';
import {CardRenderer} from '../render/CardRenderer';
import {PostludeCard} from './PostludeCard';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderItemType} from '../../../common/cards/render/CardRenderItemType';
import {IPlayer} from '../../IPlayer';
import {Resource} from '../../../common/Resource';
import {Space} from '../../boards/Space';
import {postludeVp} from './PostludeCard';

export class MobileLaunchStation extends PostludeCard {
  constructor() {
    super({
      name: CardName.MOBILE_LAUNCH_STATION,
      type: CardType.AUTOMATED,
      cost: 12,
      tags: [Tag.SPACE],
      postludeKind: 'ocean',
      victoryPoints: 'special',

      metadata: {
        cardNumber: 'L34',
        renderData: CardRenderer.builder((b) => {
          b.effect('Get 1 titanium for every space tag you own, including this. Adjacency bonus: 1 titanium.', (eb) => eb.empty().startEffect.titanium(1).slash().tag(Tag.SPACE));
        }),
        description: 'Place the Mobile Launch Station tile on top of an ocean. Get 1 titanium for every space tag you own, including this. Adjacency bonus: 1 titanium. 1 VP for every 3 titanium production you have. (The printed text says energy for the adjacency bonus, but the icon shows titanium.)',
        victoryPoints: postludeVp(CardRenderItemType.TITANIUM, 1, 3, {production: true}),
      },
    });
  }

  protected override onPlaced(player: IPlayer, _space: Space): void {
    player.stock.add(Resource.TITANIUM, this.tagCount(player, Tag.SPACE), {log: true});
  }

  public override getVictoryPoints(player: IPlayer): number {
    return Math.floor(player.production.titanium / 3);
  }
}
