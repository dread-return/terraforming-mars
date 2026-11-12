import {IGlobalEvent} from '../../globalEvents/IGlobalEvent';
import {GlobalEvent} from '../../globalEvents/GlobalEvent';
import {GlobalEventName} from '../../../../common/turmoil/globalEvents/GlobalEventName';
import {PartyName} from '../../../../common/turmoil/PartyName';
import {CardRenderer} from '../../../cards/render/CardRenderer';
import {Turmoil} from '../../Turmoil';
import {IPlayer} from '../../../IPlayer';
import {Size} from '../../../../common/cards/render/Size';

export class Favoritism extends GlobalEvent implements IGlobalEvent {
  constructor() {
    super({
      name: GlobalEventName.FAVORITISM,
      description: 'Lose 5 delegates from your reserve, reduced by 1 per 3 cards in your hand.',
      revealedDelegate: PartyName.POPULISTS,
      currentDelegate: PartyName.BUREAUCRATS,
      renderData: CardRenderer.builder((b) => {
        b.delegates(-5).nbsp.text('-1 per 3 cards in hand', {size: Size.SMALL});
      }),
    });
  }

  public override bespokeResolvePlayer(player: IPlayer) {
    const reserve = Turmoil.getTurmoil(player.game).delegateReserve;
    const count = Math.min(reserve.get(player), Math.max(0, 5 - Math.floor(player.cardsInHand.length / 3)));
    for (let i = 0; i < count; i++) {
      reserve.remove(player);
    }
    if (count > 0) {
      player.game.log('${0} lost ${1} delegate(s) from ${2}', (b) => b.player(player).number(count).globalEvent(this));
    }
  }
}
