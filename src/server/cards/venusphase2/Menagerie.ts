import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardResource} from '../../../common/CardResource';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {TileType} from '../../../common/TileType';
import {SpaceBonus} from '../../../common/boards/SpaceBonus';
import {Resource} from '../../../common/Resource';
import {Board} from '../../boards/Board';
import {RobAntillesTiles} from '../robantilles/RobAntillesTiles';
import {AddResourcesToCard} from '../../deferredActions/AddResourcesToCard';

export class Menagerie extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.AUTOMATED,
      name: CardName.MENAGERIE,
      tags: [Tag.ANIMAL, Tag.PLANT, Tag.BUILDING],
      cost: 21,
      requirements: {temperature: -10},
      tilesBuilt: [TileType.MENAGERIE],

      metadata: {
        cardNumber: 'V66',
        renderData: CardRenderer.builder((b) => {
          b.tile(TileType.MENAGERIE, false).asterix().br;
          b.production((pb) => pb.megacredits(1)).resource(CardResource.ANIMAL).asterix().slash().greenery({withO2: false}).asterix();
        }),
        description: 'Requires -10 °C. Place Menagerie on one of your greeneries. Per greenery next to it: +1 M€ production and 1 animal to any card. Adjacency bonus: 1 animal.',
      },
    });
  }

  public override bespokeCanPlay(player: IPlayer) {
    return RobAntillesTiles.ownTiles(player, TileType.GREENERY).length > 0;
  }

  public override bespokePlay(player: IPlayer) {
    return RobAntillesTiles.place(player, this.name, TileType.MENAGERIE, RobAntillesTiles.ownTiles(player, TileType.GREENERY),
      [SpaceBonus.ANIMAL], 'Select one of your greenery tiles for the Menagerie', (space) => {
        const greeneries = player.game.board.getAdjacentSpaces(space).filter(Board.isGreenerySpace).length;
        if (greeneries > 0) {
          player.production.add(Resource.MEGACREDITS, greeneries, {log: true});
          player.game.defer(new AddResourcesToCard(player, CardResource.ANIMAL, {count: greeneries}));
        }
      });
  }
}
