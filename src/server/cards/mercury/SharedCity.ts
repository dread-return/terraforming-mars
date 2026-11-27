import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {ActCard} from '../../mercury/ActCard';
import {IPlayer} from '../../IPlayer';
import {PlaceCityTile} from '../../deferredActions/PlaceCityTile';
import {Tag} from '../../../common/cards/Tag';

/**
 * A Treaty: on resolving, the initiator places a city on Mars that both players own (like Joint Venture's city:
 * it counts as each player's for effects, milestones, awards and scoring). Each owner scores it only for the
 * greeneries next to it that are not their own (see calculateVictoryPoints). The tile is marked with this card.
 */
export class SharedCity extends ActCard {
  constructor() {
    super({
      name: CardName.SHARED_CITY,
      kind: 'treaty',
      steps: 7,
      tags: [Tag.BUILDING, Tag.CITY],
      metadata: {
        cardNumber: 'ACT02',
        renderData: CardRenderer.builder((b) => {
          b.city().asterix().nbsp.greenery({any: true}).asterix();
        }),
        description: 'Resolve: the initiator places a city on Mars owned by both of you. Each of you scores it only for adjacent greeneries that are not your own.',
      },
    });
  }

  public override resolveTreaty(owner: IPlayer, other: IPlayer | undefined) {
    const game = owner.game;
    // The spaces are given explicitly, so Domes and Wilderness can't turn this into a dome on an existing city.
    const spaces = game.board.getAvailableSpacesForCity(owner);
    game.defer(new PlaceCityTile(owner, {spaces})).andThen((space) => {
      if (space?.tile === undefined) {
        return;
      }
      space.tile.card = CardName.SHARED_CITY;
      if (other !== undefined) {
        space.coOwner = other;
        game.log('${0} and ${1} share the city from ${2}', (b) => b.player(owner).player(other).cardName(CardName.SHARED_CITY));
      }
    });
  }
}
