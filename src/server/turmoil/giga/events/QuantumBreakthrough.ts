import {IGlobalEvent} from '../../globalEvents/IGlobalEvent';
import {GlobalEvent} from '../../globalEvents/GlobalEvent';
import {GlobalEventName} from '../../../../common/turmoil/globalEvents/GlobalEventName';
import {PartyName} from '../../../../common/turmoil/PartyName';
import {CardRenderer} from '../../../cards/render/CardRenderer';
import {IPlayer} from '../../../IPlayer';
import {Size} from '../../../../common/cards/render/Size';
import {influenceOf, draw} from './GigaEventHelpers';

export class QuantumBreakthrough extends GlobalEvent implements IGlobalEvent {
  constructor() {
    super({
      name: GlobalEventName.QUANTUM_BREAKTHROUGH,
      description: 'Draw 1 card per 2 levels of energy production. Influence counts as energy production.',
      revealedDelegate: PartyName.EMPOWER,
      currentDelegate: PartyName.TRANSHUMANISTS,
      renderData: CardRenderer.builder((b) => {
        b.cards(1).slash().production((pb) => pb.energy(2)).influence({size: Size.SMALL});
      }),
    });
  }

  public override bespokeResolvePlayer(player: IPlayer) {
    draw(player, Math.floor((player.production.energy + influenceOf(player)) / 2));
  }
}
