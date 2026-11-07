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
import {questionmark} from '../render/DynamicVictoryPoints';

export class EsotericCommunity extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.AUTOMATED,
      name: CardName.ESOTERIC_COMMUNITY,
      tags: [Tag.CITY, Tag.BUILDING],
      cost: 20,
      tilesBuilt: [TileType.ESOTERIC_COMMUNITY],
      victoryPoints: 'special',
      // The production icon shows -2 energy; the card text says -2 M€. Following the icon.
      behavior: {production: {energy: -2, steel: 1, titanium: 1}},

      metadata: {
        cardNumber: 'N31',
        renderData: CardRenderer.builder((b) => {
          b.production((pb) => pb.minus().energy(2).br.plus().steel(1).titanium(1)).nbsp.tile(TileType.ESOTERIC_COMMUNITY, false);
        }),
        description: 'Decrease your energy production 2 steps and increase your steel and titanium production 1 step. ' +
          'Place the Esoteric Community tile on a non-reserved area; it counts as a city. Adjacency bonus: 2 M€. 1 VP for every special tile next to it.',
        victoryPoints: questionmark(1, 1),
      },
    });
  }

  public override bespokeCanPlay(player: IPlayer) {
    return player.game.board.getAvailableSpacesOnLand(player).length > 0;
  }

  public override bespokePlay(player: IPlayer) {
    return RobAntillesTiles.place(player, this.name, TileType.ESOTERIC_COMMUNITY, player.game.board.getAvailableSpacesOnLand(player),
      [SpaceBonus.MEGACREDITS, SpaceBonus.MEGACREDITS], 'Select space for the Esoteric Community');
  }

  public override getVictoryPoints(player: IPlayer) {
    const space = RobAntillesTiles.spaceFor(player, this.name);
    if (space === undefined) {
      return 0;
    }
    return player.game.board.getAdjacentSpaces(space).filter((s) => RobAntillesTiles.isSpecialTile(s)).length;
  }
}
