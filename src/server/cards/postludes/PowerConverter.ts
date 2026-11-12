import {CardName} from '../../../common/cards/CardName';
import {CardType} from '../../../common/cards/CardType';
import {CardRenderer} from '../render/CardRenderer';
import {PostludeCard} from './PostludeCard';
import {Tag} from '../../../common/cards/Tag';
import {IActionCard} from '../ICard';
import {IPlayer} from '../../IPlayer';
import {Resource} from '../../../common/Resource';
import {SelectAmount} from '../../inputs/SelectAmount';
import {Size} from '../../../common/cards/render/Size';

export class PowerConverter extends PostludeCard implements IActionCard {
  constructor() {
    super({
      name: CardName.POWER_CONVERTER,
      type: CardType.ACTIVE,
      cost: 6,
      tags: [Tag.SCIENCE, Tag.POWER],
      postludeKind: 'city',

      metadata: {
        cardNumber: 'L15',
        renderData: CardRenderer.builder((b) => {
          b.action('Convert one energy to one heat or vice versa for every tile adjacent to the Power Converter.', (ab) => ab.empty().startAction.energy(1).arrow().heat(1).slash().emptyTile('normal', {size: Size.SMALL}).asterix());
        }),
        description: 'Place the Converter tile on top of one of your cities. Action: for every tile adjacent to the Converter, convert one energy to one heat, or one heat to one energy.',
      },
    });
  }

  public canAct(player: IPlayer): boolean {
    return this.adjacentTiles(player).length > 0 && (player.energy > 0 || player.heat > 0);
  }

  public action(player: IPlayer) {
    const conversions = this.adjacentTiles(player).length;
    const toHeat = Math.min(conversions, player.energy);
    return new SelectAmount('Energy to convert to heat', 'Convert', 0, toHeat).andThen((energy) => {
      player.stock.add(Resource.ENERGY, -energy);
      player.stock.add(Resource.HEAT, energy);
      const toEnergy = Math.min(conversions - energy, player.heat - energy);
      if (toEnergy <= 0) {
        return undefined;
      }
      return new SelectAmount('Heat to convert to energy', 'Convert', 0, toEnergy).andThen((heat) => {
        player.stock.add(Resource.HEAT, -heat);
        player.stock.add(Resource.ENERGY, heat);
        player.game.log('${0} converted ${1} energy to heat and ${2} heat to energy', (b) => b.player(player).number(energy).number(heat));
        return undefined;
      });
    });
  }
}
