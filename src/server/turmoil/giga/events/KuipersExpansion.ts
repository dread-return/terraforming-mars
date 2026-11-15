import {IGlobalEvent} from '../../globalEvents/IGlobalEvent';
import {GlobalEvent} from '../../globalEvents/GlobalEvent';
import {GlobalEventName} from '../../../../common/turmoil/globalEvents/GlobalEventName';
import {PartyName} from '../../../../common/turmoil/PartyName';
import {CardRenderer} from '../../../cards/render/CardRenderer';
import {IPlayer} from '../../../IPlayer';
import {Size} from '../../../../common/cards/render/Size';
import {influenceOf, gainOre, tagsOf} from './GigaEventHelpers';
import {Tag} from '../../../../common/cards/Tag';

export class KuipersExpansion extends GlobalEvent implements IGlobalEvent {
  constructor() {
    super({
      name: GlobalEventName.KUIPERS_EXPANSION,
      description: 'Gain 1 ore (steel or titanium) per infrastructure and influence.',
      revealedDelegate: PartyName.EMPOWER,
      currentDelegate: PartyName.SPOME,
      renderData: CardRenderer.builder((b) => {
        b.steel(1).slash().titanium(1).slash().tag(Tag.INFRASTRUCTURE).influence({size: Size.SMALL});
      }),
    });
  }

  // Infrastructure = infrastructure tags (High Orbit). Without High Orbit only influence counts.
  public override bespokeResolvePlayer(player: IPlayer) {
    gainOre(player, tagsOf(player, Tag.INFRASTRUCTURE) + influenceOf(player), this);
  }
}
