import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {Resource} from '../../../common/Resource';

export class EnergyShortcut extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.EVENT,
      name: CardName.ENERGY_SHORTCUT,
      tags: [Tag.POWER],
      cost: 2,

      metadata: {
        cardNumber: 'I48',
        renderData: CardRenderer.builder((b) => {
          b.text('all').energy(1).arrow().heat(1).asterix();
        }),
        description: 'Convert all your energy to heat.',
      },
    });
  }

  public override bespokePlay(player: IPlayer) {
    const energy = player.energy;
    if (energy > 0) {
      player.stock.deduct(Resource.ENERGY, energy);
      player.stock.add(Resource.HEAT, energy, {log: true, from: {card: this}});
    }
    return undefined;
  }
}
