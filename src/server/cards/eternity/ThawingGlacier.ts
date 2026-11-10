import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {CardResource} from '../../../common/CardResource';
import {CardType} from '../../../common/cards/CardType';
import {Card} from '../Card';
import {IPlayer} from '../../IPlayer';
import {IProjectCard} from '../IProjectCard';
import {SelectSpace} from '../../inputs/SelectSpace';
import {Tag} from '../../../common/cards/Tag';
import {TileType} from '../../../common/TileType';

export class ThawingGlacier extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.THAWING_GLACIER,
      tags: [Tag.PLANT, Tag.ANIMAL],
      cost: 17,
      requirements: {temperature: -8, max: true},
      metadata: {
        cardNumber: 'E34',
        renderData: CardRenderer.builder((b) => {
          b.tile(TileType.GLACIER, false).asterix().br;
          b.effect('Max temperature: tile becomes an ocean, +2 plant prod., 1 animal.', (eb) => {
            eb.temperature(1).asterix().startEffect.oceans(1).production((pb) => pb.plants(2)).resource(CardResource.ANIMAL).asterix();
          });
        }),
        description: 'Requires -8 \u00b0C or colder. Place this tile on an ocean area.',
      },
    });
  }

  public override bespokeCanPlay(player: IPlayer) {
    return player.game.board.getAvailableSpacesForOcean(player).length > 0;
  }
  public override bespokePlay(player: IPlayer) {
    return new SelectSpace('Select an ocean space for the Thawing Glacier', player.game.board.getAvailableSpacesForOcean(player)).andThen((space) => {
      player.game.addTile(player, space, {tileType: TileType.GLACIER, card: this.name});
      return undefined;
    });
  }
}
