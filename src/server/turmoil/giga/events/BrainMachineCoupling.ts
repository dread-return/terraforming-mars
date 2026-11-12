import {IGlobalEvent} from '../../globalEvents/IGlobalEvent';
import {GlobalEvent} from '../../globalEvents/GlobalEvent';
import {GlobalEventName} from '../../../../common/turmoil/globalEvents/GlobalEventName';
import {PartyName} from '../../../../common/turmoil/PartyName';
import {CardRenderer} from '../../../cards/render/CardRenderer';
import {Turmoil} from '../../Turmoil';
import {IPlayer} from '../../../IPlayer';
import {Size} from '../../../../common/cards/render/Size';
import {influenceOf, citiesOf} from './GigaEventHelpers';

export class BrainMachineCoupling extends GlobalEvent implements IGlobalEvent {
  constructor() {
    super({
      name: GlobalEventName.BRAIN_MACHINE_COUPLING,
      description: 'Gain 1 delegate per 2 cities you own. Influence counts as cities.',
      revealedDelegate: PartyName.TRANSHUMANISTS,
      currentDelegate: PartyName.BUREAUCRATS,
      renderData: CardRenderer.builder((b) => {
        b.delegates(1).slash().text('2', {size: Size.SMALL}).city().influence({size: Size.SMALL});
      }),
    });
  }

  public override bespokeResolvePlayer(player: IPlayer) {
    const count = Math.floor((citiesOf(player) + influenceOf(player)) / 2);
    if (count > 0) {
      Turmoil.getTurmoil(player.game).delegateReserve.add(player, count);
      player.game.log('${0} gained ${1} delegate(s) from ${2}', (b) => b.player(player).number(count).globalEvent(this));
    }
  }
}
