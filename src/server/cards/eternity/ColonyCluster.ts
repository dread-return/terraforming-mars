import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {CardType} from '../../../common/cards/CardType';
import {Card} from '../Card';
import {IPlayer} from '../../IPlayer';
import {IProjectCard} from '../IProjectCard';
import {MAX_COLONIES_PER_TILE} from '../../../common/constants';
import {SelectColony} from '../../inputs/SelectColony';
import {Size} from '../../../common/cards/render/Size';
import {Tag} from '../../../common/cards/Tag';

export class ColonyCluster extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.AUTOMATED,
      name: CardName.COLONY_CLUSTER,
      tags: [Tag.SPACE],
      cost: 20,
      metadata: {
        cardNumber: 'E57',
        renderData: CardRenderer.builder((b) => {
          b.colonies(1).colonies(1).asterix().br;
          b.text('Place a colony and a neutral colony on the same colony tile. Collect both placement bonuses.', {size: Size.SMALL, isBold: false});
        }),
      },
    });
  }

  private tiles(player: IPlayer) {
    return player.game.colonies.filter((c) => c.isActive && c.colonies.length <= MAX_COLONIES_PER_TILE - 2 && !c.colonies.includes(player.id));
  }
  public override bespokeCanPlay(player: IPlayer) {
    return this.tiles(player).length > 0;
  }
  public override bespokePlay(player: IPlayer) {
    return new SelectColony('Select a colony tile for your colony and a neutral colony', 'Build', this.tiles(player)).andThen((colony) => {
      colony.addColony(player);
      colony.addNeutralColony(player);
      return undefined;
    });
  }
}
