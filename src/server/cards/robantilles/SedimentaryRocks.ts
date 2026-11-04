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
import {max} from '../Options';

export class SedimentaryRocks extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.AUTOMATED,
      name: CardName.SEDIMENTARY_ROCKS,
      tags: [Tag.BUILDING],
      cost: 5,
      requirements: {cities: 3, max, all: true},
      tilesBuilt: [TileType.SEDIMENT],

      metadata: {
        cardNumber: 'H57',
        renderData: CardRenderer.builder((b) => {
          b.tile(TileType.SEDIMENT, false).asterix().br;
          b.city().asterix().colon().megacredits(3);
        }),
        description: 'Requires 3 or fewer cities in play. Place the Sediment tile. Any player may later place a city on it, ' +
          'ignoring placement rules, and gains 3 M€ when they do. Adjacency bonus: 1 titanium.',
      },
    });
  }

  public override bespokeCanPlay(player: IPlayer) {
    return player.game.board.getAvailableSpacesOnLand(player).length > 0;
  }

  public override bespokePlay(player: IPlayer) {
    return RobAntillesTiles.place(player, this.name, TileType.SEDIMENT, player.game.board.getAvailableSpacesOnLand(player),
      [SpaceBonus.TITANIUM], 'Select space for the Sediment tile');
  }
}
