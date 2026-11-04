import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {Resource} from '../../../common/Resource';
import {Board} from '../../boards/Board';
import {BettermentsUtils} from './BettermentsUtils';

export class Pipes extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.AUTOMATED,
      name: CardName.PIPES,
      tags: [Tag.BUILDING],
      cost: 6,

      metadata: {
        cardNumber: 'B22',
        renderData: CardRenderer.builder((b) => {
          b.megacredits(1).slash().emptyTile().asterix().oceans(1);
        }),
        description: 'Gain 1 M€ for each tile you own that is next to at least one ocean tile.',
      },
    });
  }

  public static count(player: IPlayer): number {
    // Oceans have no owner, so the tiles counted are the player's own non-ocean tiles.
    return BettermentsUtils.tilesOnMars(player)
      .filter((space) => !Board.isOceanSpace(space))
      .filter((space) => BettermentsUtils.adjacentOceans(player, space) >= 1)
      .length;
  }

  public override bespokePlay(player: IPlayer) {
    player.stock.add(Resource.MEGACREDITS, Pipes.count(player), {log: true});
    return undefined;
  }
}
