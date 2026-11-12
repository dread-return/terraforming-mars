import {IGlobalEvent} from '../../globalEvents/IGlobalEvent';
import {GlobalEvent} from '../../globalEvents/GlobalEvent';
import {GlobalEventName} from '../../../../common/turmoil/globalEvents/GlobalEventName';
import {PartyName} from '../../../../common/turmoil/PartyName';
import {CardRenderer} from '../../../cards/render/CardRenderer';
import {IPlayer} from '../../../IPlayer';
import {Size} from '../../../../common/cards/render/Size';
import {influenceOf, gainOre} from './GigaEventHelpers';

export class KuipersExpansion extends GlobalEvent implements IGlobalEvent {
  constructor() {
    super({
      name: GlobalEventName.KUIPERS_EXPANSION,
      description: 'Gain 1 ore (steel or titanium) per infrastructure and influence.',
      revealedDelegate: PartyName.EMPOWER,
      currentDelegate: PartyName.SPOME,
      renderData: CardRenderer.builder((b) => {
        b.steel(1).slash().titanium(1).slash().influence({size: Size.SMALL});
      }),
    });
  }

  // TODO(Leo): there is no infrastructure tag yet, so only influence counts for now.
  public override bespokeResolvePlayer(player: IPlayer) {
    gainOre(player, influenceOf(player), this);
  }
}
