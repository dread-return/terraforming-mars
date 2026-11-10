import {Board} from '../../boards/Board';
import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {CardType} from '../../../common/cards/CardType';
import {Card} from '../Card';
import {IPlayer} from '../../IPlayer';
import {IProjectCard} from '../IProjectCard';
import {Resource} from '../../../common/Resource';
import {SelectSpace} from '../../inputs/SelectSpace';
import {Tag} from '../../../common/cards/Tag';
import {digit} from '../Options';

export class DemolishTheCityForScrap extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.EVENT,
      name: CardName.DEMOLISH_THE_CITY_FOR_SCRAP,
      tags: [Tag.BUILDING, Tag.MARS, Tag.EVENT],
      cost: 5,
      metadata: {
        cardNumber: 'E62',
        renderData: CardRenderer.builder((b) => {
          b.minus().city().asterix().minus().tr(1).br.titanium(10, {digit}).steel(10, {digit});
        }),
        description: 'Requires that you have a city tile. Remove one of your cities from the board. Lower your TR 1 step. Gain 10 titanium and 10 steel.',
      },
    });
  }

  private cities(player: IPlayer) {
    return player.game.board.spaces.filter((s) => s.player === player && Board.isCitySpace(s) && s.tile?.covers === undefined && s.spaceType !== 'colony');
  }
  public override bespokeCanPlay(player: IPlayer) {
    return this.cities(player).length > 0;
  }
  public override bespokePlay(player: IPlayer) {
    return new SelectSpace('Select one of your cities to remove', this.cities(player)).andThen((space) => {
      player.game.removeTile(space.id);
      player.decreaseTerraformRating(1, {log: true});
      player.stock.add(Resource.TITANIUM, 10, {log: true});
      player.stock.add(Resource.STEEL, 10, {log: true});
      return undefined;
    });
  }
}
