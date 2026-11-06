import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {TileType} from '../../../common/TileType';
import {SpaceBonus} from '../../../common/boards/SpaceBonus';
import {RobAntillesTiles} from '../robantilles/RobAntillesTiles';

export class InvakCity extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.AUTOMATED,
      name: CardName.INVAK_CITY,
      tags: [Tag.CITY, Tag.BUILDING],
      cost: 21,
      requirements: {greeneries: 1},
      victoryPoints: 1,
      tilesBuilt: [TileType.INVAK_CITY],

      behavior: {
        production: {energy: -1, megacredits: 3},
      },

      metadata: {
        cardNumber: 'I36',
        renderData: CardRenderer.builder((b) => {
          b.production((pb) => pb.minus().energy(1).br.megacredits(3)).nbsp.tile(TileType.INVAK_CITY, false).asterix();
        }),
        description: 'Requires a greenery. Energy prod -1, M€ prod +3. ' +
          'Replace one of your greeneries with Invak City: it counts as a city and a greenery. Adjacency bonus: 2 M€.',
      },
    });
  }

  public override bespokeCanPlay(player: IPlayer) {
    return RobAntillesTiles.ownTiles(player, TileType.GREENERY).length > 0;
  }

  public override bespokePlay(player: IPlayer) {
    return RobAntillesTiles.place(player, this.name, TileType.INVAK_CITY, RobAntillesTiles.ownTiles(player, TileType.GREENERY),
      [SpaceBonus.MEGACREDITS, SpaceBonus.MEGACREDITS], 'Select one of your greenery tiles for Invak City');
  }
}
