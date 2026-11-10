import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {PreludeCard} from '../prelude/PreludeCard';
import {SelectSpace} from '../../inputs/SelectSpace';
import {Tag} from '../../../common/cards/Tag';

export class DustMiningSettlement extends PreludeCard {
  constructor() {
    super({
      name: CardName.DUST_MINING_SETTLEMENT,
      tags: [Tag.MARS, Tag.CITY, Tag.BUILDING],
      behavior: {
        production: {megacredits: 2},
        stock: {megacredits: 4},
      },
      metadata: {
        cardNumber: 'EP13',
        renderData: CardRenderer.builder((b) => {
          b.city().asterix().production((pb) => pb.megacredits(2)).megacredits(4);
        }),
        description: 'Place a city tile on a space with no placement bonus. Increase your M\u20ac production 2 steps. Gain 4 M\u20ac.',
      },
    });
  }

  private spaces(player: IPlayer) {
    return player.game.board.getAvailableSpacesForCity(player).filter((s) => s.bonus.length === 0);
  }
  public override bespokeCanPlay(player: IPlayer) {
    return this.spaces(player).length > 0;
  }
  public override bespokePlay(player: IPlayer) {
    player.defer(new SelectSpace('Select a space with no placement bonus for your city', this.spaces(player)).andThen((space) => {
      player.game.addCity(player, space);
      return undefined;
    }));
    return undefined;
  }
}
