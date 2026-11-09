import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {Space} from '../../boards/Space';
import {Board} from '../../boards/Board';
import {Resource} from '../../../common/Resource';
import {PlaceCityTile} from '../../deferredActions/PlaceCityTile';
import {SelectPlayer} from '../../inputs/SelectPlayer';
import {message} from '../../logs/MessageBuilder';
import {all} from '../Options';

export class Outskirts extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.AUTOMATED,
      name: CardName.OUTSKIRTS,
      tags: [Tag.CITY, Tag.BUILDING],
      cost: 14,
      requirements: {oxygen: 13},

      behavior: {
        production: {megacredits: 2},
      },

      metadata: {
        cardNumber: 'V68',
        renderData: CardRenderer.builder((b) => {
          b.city().asterix().br;
          b.production((pb) => pb.minus().energy(1, {all}).asterix().nbsp.plus().megacredits(2));
        }),
        description: 'Requires 13% oxygen. Place a city tile next to at least 1 other city. ' +
          'Decrease the energy production of that city\'s owner 1 step. Increase your M€ production 2 steps.',
      },
    });
  }

  private static spaces(player: IPlayer): ReadonlyArray<Space> {
    const board = player.game.board;
    return board.getAvailableSpacesOnLand(player)
      .filter((space) => board.getAdjacentSpaces(space).some(Board.isCitySpace));
  }

  public override bespokeCanPlay(player: IPlayer) {
    return Outskirts.spaces(player).length > 0;
  }

  public override bespokePlay(player: IPlayer) {
    player.game.defer(new PlaceCityTile(player, {spaces: Outskirts.spaces(player), title: 'Select a space next to a city for Outskirts'}))
      .andThen((space) => {
        if (space === undefined) {
          return;
        }
        const board = player.game.board;
        const owners = new Set<IPlayer>();
        for (const adj of board.getAdjacentSpaces(space)) {
          if (Board.isCitySpace(adj) && adj.player !== undefined && adj.player.name !== 'neutral') {
            owners.add(adj.player);
          }
        }
        const targets = [...owners].filter((p) => p.production.energy > 0);
        if (targets.length === 0) {
          return;
        }
        const decrease = (target: IPlayer) => {
          if (target === player) {
            player.production.add(Resource.ENERGY, -1, {log: true});
            return undefined;
          }
          target.maybeBlockAttack(player, message('lose ${0} ${1} production', (b) => b.number(1).string(Resource.ENERGY)), (proceed) => {
            if (proceed) {
              target.production.add(Resource.ENERGY, -1, {log: true, from: {player}});
            }
            return undefined;
          });
          return undefined;
        };
        if (targets.length === 1) {
          decrease(targets[0]);
        } else {
          player.defer(new SelectPlayer(targets, 'Select the city owner to lose 1 energy production', 'Decrease').andThen(decrease));
        }
      });
    return undefined;
  }
}
