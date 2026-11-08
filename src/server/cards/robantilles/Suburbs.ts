import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {TileType} from '../../../common/TileType';
import {SpaceBonus} from '../../../common/boards/SpaceBonus';
import {RobAntillesTiles} from './RobAntillesTiles';

export class Suburbs extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.AUTOMATED,
      name: CardName.SUBURBS,
      tags: [Tag.CITY, Tag.BUILDING],
      cost: 21,
      tilesBuilt: [TileType.SUBURBS],

      behavior: {
        production: {megacredits: 3},
      },

      metadata: {
        cardNumber: 'H01',
        renderData: CardRenderer.builder((b) => {
          b.production((pb) => pb.megacredits(3)).nbsp.tile(TileType.SUBURBS, false).asterix();
        }),
        description: 'Increase your M€ production 3 steps. Place the Suburbs tile on top of one of your greenery tiles. ' +
          'It counts as a city and a greenery. Adjacency bonus: 1 M€.',
      },
    });
  }

  public override bespokeCanPlay(player: IPlayer) {
    return RobAntillesTiles.ownTiles(player, TileType.GREENERY).length > 0;
  }

  public override bespokePlay(player: IPlayer) {
    return RobAntillesTiles.place(player, this.name, TileType.SUBURBS, RobAntillesTiles.ownTiles(player, TileType.GREENERY),
      [SpaceBonus.MEGACREDITS], 'Select one of your greenery tiles for Suburbs');
  }
}
