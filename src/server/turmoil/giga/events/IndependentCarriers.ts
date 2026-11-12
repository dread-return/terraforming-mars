import {IGlobalEvent} from '../../globalEvents/IGlobalEvent';
import {GlobalEvent} from '../../globalEvents/GlobalEvent';
import {GlobalEventName} from '../../../../common/turmoil/globalEvents/GlobalEventName';
import {PartyName} from '../../../../common/turmoil/PartyName';
import {CardRenderer} from '../../../cards/render/CardRenderer';
import {IPlayer} from '../../../IPlayer';
import {IGame} from '../../../IGame';
import {Size} from '../../../../common/cards/render/Size';
import {SelectColony} from '../../../inputs/SelectColony';
import {influenceOf} from './GigaEventHelpers';

export class IndependentCarriers extends GlobalEvent implements IGlobalEvent {
  constructor() {
    super({
      name: GlobalEventName.INDEPENDENT_CARRIERS,
      description: 'Receive the colony bonus of one of your colonies for each influence you have. Move the marker on every colony track 1 space down.',
      revealedDelegate: PartyName.BUREAUCRATS,
      currentDelegate: PartyName.SPOME,
      renderData: CardRenderer.builder((b) => {
        b.text('Colony bonus', {size: Size.SMALL}).slash().influence({size: Size.SMALL}).nbsp.text('Colony tracks -1', {size: Size.SMALL});
      }),
    });
  }

  public override bespokeResolve(game: IGame) {
    for (const colony of game.colonies) {
      colony.decreaseTrack();
    }
  }

  public override bespokeResolvePlayer(player: IPlayer) {
    const owned = player.game.colonies.filter((colony) => colony.colonies.includes(player.id));
    if (owned.length === 0) {
      return;
    }
    for (let i = 0; i < influenceOf(player); i++) {
      player.defer(() => {
        if (owned.length === 1) {
          return owned[0].giveColonyBonus(player);
        }
        return new SelectColony('Independent Carriers Global Event - select a colony to receive its colony bonus', 'Receive', owned)
          .andThen((colony) => colony.giveColonyBonus(player));
      });
    }
  }
}
