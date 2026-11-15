import {CardName} from '../../../common/cards/CardName';
import {CardType} from '../../../common/cards/CardType';
import {Tag} from '../../../common/cards/Tag';
import {CardResource} from '../../../common/CardResource';
import {CardRenderer} from '../render/CardRenderer';
import {PostludeCard, postludeVp} from './PostludeCard';
import {CardRenderItemType} from '../../../common/cards/render/CardRenderItemType';
import {Size} from '../../../common/cards/render/Size';
import {IPlayer} from '../../IPlayer';
import {Space} from '../../boards/Space';
import {AddResourcesToCard} from '../../deferredActions/AddResourcesToCard';
import {HighOrbit} from '../../highOrbit/HighOrbit';

/**
 * Only dealt when High Orbit is in the game (infrastructure tag and ore). It holds ore itself, so the ore it
 * gives always has somewhere to go.
 */
export class OreRefinery extends PostludeCard {
  constructor() {
    super({
      name: CardName.ORE_REFINERY,
      type: CardType.AUTOMATED,
      cost: 7,
      tags: [Tag.INFRASTRUCTURE],
      postludeKind: 'ocean',
      resourceType: CardResource.ORE,
      victoryPoints: 'special',

      metadata: {
        cardNumber: 'L36',
        renderData: CardRenderer.builder((b) => {
          b.resource(CardResource.ORE).asterix().slash().tag(Tag.INFRASTRUCTURE).br;
          b.text('adjacency bonus:', {size: Size.SMALL}).resource(CardResource.ORE).asterix();
        }),
        description: 'Place the Ore Refinery tile on top of an ocean. Get 1 ore (on any card) for every infrastructure tag you own, including this. Adjacency bonus: 1 ore. 1 VP for every 4 ore resources you have.',
        victoryPoints: postludeVp(CardRenderItemType.RESOURCE, 1, 4, {resource: CardResource.ORE, asterisk: true}),
      },
    });
  }

  protected override onPlaced(player: IPlayer, _space: Space): void {
    // The card is in play by now, so its own tag is counted.
    const count = player.tags.count(Tag.INFRASTRUCTURE, 'raw');
    if (count > 0) {
      player.game.defer(new AddResourcesToCard(player, CardResource.ORE, {count}));
    }
  }

  public override getVictoryPoints(player: IPlayer): number {
    return Math.floor(HighOrbit.oreOnCards(player) / 4);
  }
}
