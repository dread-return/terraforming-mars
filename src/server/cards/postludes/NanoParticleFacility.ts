import {CardName} from '../../../common/cards/CardName';
import {CardType} from '../../../common/cards/CardType';
import {CardRenderer} from '../render/CardRenderer';
import {PostludeCard} from './PostludeCard';
import {Tag} from '../../../common/cards/Tag';
import {IActionCard} from '../ICard';
import {IPlayer} from '../../IPlayer';
import {SelectResources} from '../../inputs/SelectResources';
import {Size} from '../../../common/cards/render/Size';
import {message} from '../../logs/MessageBuilder';

export class NanoParticleFacility extends PostludeCard implements IActionCard {
  constructor() {
    super({
      name: CardName.NANO_PARTICLE_FACILITY,
      type: CardType.ACTIVE,
      cost: 17,
      tags: [Tag.SCIENCE],
      postludeKind: 'city',

      metadata: {
        cardNumber: 'L13',
        renderData: CardRenderer.builder((b) => {
          b.action('Get one wild standard resource for every 2 tiles adjacent to the Nano-Particle Facility.', (ab) => ab.empty().startAction.wild(1).slash().text('2').emptyTile('normal', {size: Size.SMALL}).asterix());
        }),
        description: 'Place the Nano-Particle Facility tile on top of one of your cities. Action: get one standard resource of your choice for every 2 tiles adjacent to the Nano-Particle Facility.',
      },
    });
  }

  private count(player: IPlayer): number {
    return Math.floor(this.adjacentTiles(player).length / 2);
  }

  public canAct(player: IPlayer): boolean {
    return this.count(player) > 0;
  }

  public action(player: IPlayer) {
    const count = this.count(player);
    return new SelectResources(message('Gain ${0} standard resources', (b) => b.number(count)), count)
      .andThen((units) => {
        player.stock.adjust(units, {log: true});
        return undefined;
      });
  }
}
