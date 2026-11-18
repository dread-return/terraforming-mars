import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {PartyName} from '../../../common/turmoil/PartyName';
import {IPlayer} from '../../IPlayer';
import {TileType} from '../../../common/TileType';
import {SelectSpace} from '../../inputs/SelectSpace';

/**
 * I40. The city is placed with the normal city rules and gives you the placement bonuses, but it
 * belongs to no player: it scores for nobody and counts for nobody's milestones, but counts as a city
 * in play (and next to greeneries for their owners' city adjacency, as usual).
 */
export class FreeCity extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.AUTOMATED,
      name: CardName.FREE_CITY,
      tags: [Tag.CITY, Tag.BUILDING],
      cost: 8,
      victoryPoints: 2,
      requirements: {party: PartyName.POPULISTS},

      metadata: {
        cardNumber: 'I40',
        renderData: CardRenderer.builder((b) => {
          b.city().asterix();
        }),
        description: 'Requires that Populists are ruling or that you have 2 delegates there. Place a city tile on a non-reserved area, but don\'t put your player marker on it.',
      },
    });
  }

  public override bespokeCanPlay(player: IPlayer) {
    return player.game.board.getAvailableSpacesForCity(player).length > 0;
  }

  public override bespokePlay(player: IPlayer) {
    return new SelectSpace('Select space for the Free City', player.game.board.getAvailableSpacesForCity(player))
      .andThen((space) => {
        player.game.addTile(player, space, {tileType: TileType.CITY, card: this.name});
        space.player = undefined;
        player.game.log('The Free City belongs to no player', (b) => b);
        return undefined;
      });
  }
}
