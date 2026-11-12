import {IGlobalEvent} from '../../globalEvents/IGlobalEvent';
import {GlobalEvent} from '../../globalEvents/GlobalEvent';
import {GlobalEventName} from '../../../../common/turmoil/globalEvents/GlobalEventName';
import {PartyName} from '../../../../common/turmoil/PartyName';
import {CardRenderer} from '../../../cards/render/CardRenderer';
import {IPlayer} from '../../../IPlayer';
import {Size} from '../../../../common/cards/render/Size';
import {influenceOf, draw} from './GigaEventHelpers';

export class InterstellarSignal extends GlobalEvent implements IGlobalEvent {
  constructor() {
    super({
      name: GlobalEventName.INTERSTELLAR_SIGNAL,
      description: 'Draw 1 card per influence.',
      revealedDelegate: PartyName.BUREAUCRATS,
      currentDelegate: PartyName.SPOME,
      renderData: CardRenderer.builder((b) => {
        b.cards(1).slash().influence({size: Size.SMALL});
      }),
    });
  }

  public override bespokeResolvePlayer(player: IPlayer) {
    draw(player, influenceOf(player));
  }
}
