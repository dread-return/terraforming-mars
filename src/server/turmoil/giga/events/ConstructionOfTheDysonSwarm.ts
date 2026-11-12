import {IGlobalEvent} from '../../globalEvents/IGlobalEvent';
import {GlobalEvent} from '../../globalEvents/GlobalEvent';
import {GlobalEventName} from '../../../../common/turmoil/globalEvents/GlobalEventName';
import {PartyName} from '../../../../common/turmoil/PartyName';
import {CardRenderer} from '../../../cards/render/CardRenderer';
import {Size} from '../../../../common/cards/render/Size';

export class ConstructionOfTheDysonSwarm extends GlobalEvent implements IGlobalEvent {
  constructor() {
    super({
      name: GlobalEventName.CONSTRUCTION_OF_THE_DYSON_SWARM,
      description: 'Lose 2 M€ per infrastructure you have. The player with the most infrastructures raises their TR 2 steps, the second 1 step.',
      revealedDelegate: PartyName.BUREAUCRATS,
      currentDelegate: PartyName.POPULISTS,
      renderData: CardRenderer.builder((b) => {
        b.megacredits(-2).slash().text('infrastructure', {size: Size.SMALL}).br;
        b.text('1st:', {size: Size.SMALL}).tr(2, {size: Size.TINY}).nbsp.text('2nd:', {size: Size.SMALL}).tr(1, {size: Size.TINY});
      }),
    });
  }

  // TODO(Leo): there is no infrastructure tag yet, so this event does nothing for now (its delegates still count).
}
