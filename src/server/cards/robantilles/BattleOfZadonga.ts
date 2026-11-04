import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {Space} from '../../boards/Space';
import {SelectSpace} from '../../inputs/SelectSpace';
import {all} from '../Options';

export class BattleOfZadonga extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.EVENT,
      name: CardName.BATTLE_OF_ZADONGA,
      tags: [],
      cost: 25,

      metadata: {
        cardNumber: 'H20',
        renderData: CardRenderer.builder((b) => {
          b.city({all}).asterix().text('co-own');
        }),
        description: 'Put your player marker on a city an opponent owns. You both own that city for scoring and effects.',
      },
    });
  }

  private spaces(player: IPlayer): ReadonlyArray<Space> {
    return player.game.board.getCities().filter((space) =>
      space.player !== undefined && space.player !== player && space.coOwner === undefined);
  }

  public override bespokeCanPlay(player: IPlayer) {
    return this.spaces(player).length > 0;
  }

  public override bespokePlay(player: IPlayer) {
    return new SelectSpace('Select an opponent\'s city to co-own', this.spaces(player))
      .andThen((space) => {
        space.coOwner = player;
        player.game.log('${0} now co-owns the city on ${1}', (b) => b.player(player).space(space));
        return undefined;
      });
  }
}
