import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {Resource} from '../../../common/Resource';
import {SelectPlayer} from '../../inputs/SelectPlayer';
import {PlaceCityTile} from '../../deferredActions/PlaceCityTile';
import {all} from '../Options';

export class JointVenture extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.AUTOMATED,
      name: CardName.JOINT_VENTURE,
      tags: [Tag.CITY, Tag.BUILDING],
      cost: 16,
      victoryPoints: 1,

      metadata: {
        cardNumber: 'B35',
        renderData: CardRenderer.builder((b) => {
          b.production((pb) => pb.minus().energy(1, {all})).br;
          b.city().asterix();
        }),
        description: 'Decrease any opponent\'s energy production 1 step. Place a city tile owned by both you and that opponent. ' +
          'It counts as theirs and yours for effects and scoring.',
      },
    });
  }

  private targets(player: IPlayer): Array<IPlayer> {
    return player.opponents.filter((o) => o.canHaveProductionReduced(Resource.ENERGY, 1, player));
  }

  public override bespokeCanPlay(player: IPlayer) {
    if (player.game.board.getAvailableSpacesForCity(player).length === 0) {
      return false;
    }
    return player.game.isSoloMode() || this.targets(player).length > 0;
  }

  public override bespokePlay(player: IPlayer) {
    const game = player.game;
    if (game.isSoloMode()) {
      game.defer(new PlaceCityTile(player));
      return undefined;
    }
    return new SelectPlayer(this.targets(player), 'Select the opponent to partner with', 'Partner')
      .andThen((partner) => {
        partner.production.add(Resource.ENERGY, -1, {log: true, from: {player}});
        game.defer(new PlaceCityTile(player)).andThen((space) => {
          if (space !== undefined) {
            space.coOwner = partner;
            game.log('${0} co-owns the city placed by ${1}', (b) => b.player(partner).player(player));
          }
        });
        return undefined;
      });
  }
}
