import {CardName} from '../../../common/cards/CardName';
import {CardType} from '../../../common/cards/CardType';
import {CardRenderer} from '../render/CardRenderer';
import {PostludeCard} from './PostludeCard';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderItemType} from '../../../common/cards/render/CardRenderItemType';
import {IPlayer} from '../../IPlayer';
import {SelectResources} from '../../inputs/SelectResources';
import {Space} from '../../boards/Space';
import {Units} from '../../../common/Units';
import {postludeVp} from './PostludeCard';
import {SimpleDeferredAction} from '../../deferredActions/DeferredAction';

export class SkyElevator extends PostludeCard {
  constructor() {
    super({
      name: CardName.SKY_ELEVATOR,
      type: CardType.AUTOMATED,
      cost: 9,
      tags: [Tag.EARTH],
      postludeKind: 'ocean',
      victoryPoints: 'special',

      metadata: {
        cardNumber: 'L42',
        renderData: CardRenderer.builder((b) => {
          b.wild(2);
        }),
        description: 'Place the Sky Elevator tile on top of an ocean. Get 2 standard resources of your choice. Adjacency bonus: 1 standard resource of your choice. 1 VP for every production bigger than 5.',
        victoryPoints: postludeVp(CardRenderItemType.EMPTY_TILE, 1, 1, {production: true}),
      },
    });
  }

  protected override onPlaced(player: IPlayer, _space: Space): void {
    player.game.defer(new SimpleDeferredAction(player, () => new SelectResources('Gain 2 standard resources', 2).andThen((units) => {
      player.stock.adjust(units, {log: true});
      return undefined;
    })));
  }

  public override getVictoryPoints(player: IPlayer): number {
    return Units.values(player.production.asUnits()).filter((value) => value > 5).length;
  }
}
