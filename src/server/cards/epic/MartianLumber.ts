import {ActiveCorporationCard} from '../corporation/CorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';
import {IPlayer} from '../../IPlayer';
import {Resource} from '../../../common/Resource';
import {Space} from '../../boards/Space';
import {SpaceType} from '../../../common/boards/SpaceType';
import {TileType} from '../../../common/TileType';
import {digit} from '../Options';
import {SelectSpace} from '../../inputs/SelectSpace';

export class MartianLumber extends ActiveCorporationCard {
  constructor() {
    super({
      name: CardName.MARTIAN_LUMBER,
      tags: [Tag.PLANT, Tag.BUILDING],
      startingMegaCredits: 36,

      behavior: {
        stock: {plants: 2},
        production: {plants: 1},
      },

      action: {},

      metadata: {
        cardNumber: 'EP-MLB',
        description: 'You start with 36 M€, 2 plants and 1 plant production.',
        renderData: CardRenderer.builder((b) => {
          b.megacredits(36).plants(2, {digit}).production((pb) => pb.plants(1));
          b.corpBox('effect-action', (ce) => {
            ce.vSpace(Size.SMALL);
            ce.effect('Spend plants as if they were steel.', (eb) => {
              eb.plants(1).startEffect.steel(1);
            });
            ce.vSpace(Size.TINY);
            ce.action('Remove your greenery from Mars: 4 plants, +1 temperature.', (eb) => {
              eb.greenery({size: Size.SMALL}).asterix().startAction.plants(4, {digit}).temperature(1);
            });
          });
        }),
      },
    });
  }

  private greeneries(player: IPlayer): Array<Space> {
    return player.game.board.spaces.filter((space) =>
      space.tile?.tileType === TileType.GREENERY && space.player?.id === player.id && space.spaceType !== SpaceType.COLONY);
  }

  public override bespokeCanAct(player: IPlayer) {
    return this.greeneries(player).length > 0;
  }

  public override bespokeAction(player: IPlayer) {
    return new SelectSpace('Select one of your greeneries to remove', this.greeneries(player)).andThen((space) => {
      const game = player.game;
      game.removeTile(space.id);
      game.log('${0} removed a greenery', (b) => b.player(player));
      player.stock.add(Resource.PLANTS, 4, {log: true});
      game.increaseTemperature(player, 1);
      return undefined;
    });
  }
}
