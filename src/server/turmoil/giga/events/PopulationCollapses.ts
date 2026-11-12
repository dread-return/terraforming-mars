import {IGlobalEvent} from '../../globalEvents/IGlobalEvent';
import {GlobalEvent} from '../../globalEvents/GlobalEvent';
import {GlobalEventName} from '../../../../common/turmoil/globalEvents/GlobalEventName';
import {PartyName} from '../../../../common/turmoil/PartyName';
import {CardRenderer} from '../../../cards/render/CardRenderer';
import {Resource} from '../../../../common/Resource';
import {IPlayer} from '../../../IPlayer';
import {IGame} from '../../../IGame';
import {Size} from '../../../../common/cards/render/Size';
import {gain} from './GigaEventHelpers';

export class PopulationCollapses extends GlobalEvent implements IGlobalEvent {
  constructor() {
    super({
      name: GlobalEventName.POPULATION_COLLAPSES,
      description: 'Move the marker on every colony track 1 space down. Gain 2 M€ per colony you have.',
      revealedDelegate: PartyName.EMPOWER,
      currentDelegate: PartyName.POPULISTS,
      renderData: CardRenderer.builder((b) => {
        b.text('Colony tracks -1', {size: Size.SMALL}).nbsp.megacredits(2).slash().colonies(1);
      }),
    });
  }

  public override bespokeResolve(game: IGame) {
    for (const colony of game.colonies) {
      colony.decreaseTrack();
    }
  }

  public override bespokeResolvePlayer(player: IPlayer) {
    gain(player, Resource.MEGACREDITS, 2 * player.getColoniesCount(), this);
  }
}
