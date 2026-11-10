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

export class Gentrification extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.EVENT,
      name: CardName.GENTRIFICATION,
      tags: [Tag.CITY],
      cost: 2,
      requirements: {display: 'generation', count: 7, max: true},
      victoryPoints: -1,
      metadata: {
        cardNumber: 'E13',
        renderData: CardRenderer.builder((b) => {
          b.text('Swap an opponent\'s city marker for yours. Pay that player 35 M€.');
        }),
        description: "It must be generation 7 or earlier. Replace an opponent's player marker on a city tile with yours, and pay that player 35 M\u20ac.",
      },
    });
  }

  private targets(player: IPlayer) {
    return player.game.board.spaces.filter((s) => Board.isCitySpace(s) && s.player !== undefined && s.player !== player && s.tile?.covers === undefined);
  }
  public override bespokeCanPlay(player: IPlayer) {
    return player.game.generation <= 7 && this.targets(player).length > 0 && player.canAfford(35 + player.getCardCost(this));
  }
  public override bespokePlay(player: IPlayer) {
    return new SelectSpace('Select an opponent\'s city to take over', this.targets(player)).andThen((space) => {
      const owner = space.player;
      if (owner !== undefined) {
        player.stock.deduct(Resource.MEGACREDITS, 35);
        owner.stock.add(Resource.MEGACREDITS, 35, {log: true});
        space.player = player;
        player.game.log('${0} took over ${1}\'s city', (b) => b.player(player).player(owner));
      }
      return undefined;
    });
  }
}
